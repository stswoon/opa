import {v4 as uuid} from "uuid";
import {WsRoomCallback, WsService} from "./WsService";
import {AppState} from "./AppStateModels";

const setUserId = (userId: string): void => localStorage.setItem("userId", userId);
const getUserId = (): string | null => localStorage.getItem("userId");
const setUserName = (userName: string): void => localStorage.setItem("userName", userName);
const getUserName = (): string | null => localStorage.getItem("userName");
const setNewUserName = (userName: string): void => {
    setUserName(userName);
    init();
}
const setNewUserId = (): void => {
    setUserId(uuid());
    init();
}

const showUsernamePopup = (): void => {
    // document.getElementById("opa-username-popup").setAttribute("username", getUserName() || "");
    document.querySelector(".opa-username-component > ui5-input")!.setAttribute("value", getUserName() || "");
    const dialog: any = document.getElementById("opa-username-dialog");
    dialog.show();
}

const closeUsernamePopup = (): void => {
    const dialog: any = document.getElementById("opa-username-dialog");
    dialog.close();
}

let roomId: string | null;
const getRoomId = (): string | null => roomId;
const createRoom = (): void => {
    roomId = uuid();
    window.location.href = window.location.origin + "?room=" + roomId;
};
const leaveRoom = (): void => {
    WsService.disconnect();
    roomId = null;
    callbacks = [];
    window.location.href = window.location.origin;
};

const init = (): void => {
    if (getUserId() == null) {
        setUserId(uuid());
    }
    roomId = (new URL(location.href)).searchParams.get("room");
    if (roomId) {
        showRoom()
    } else {
        hideRoom()
    }
    if (getUserName() == null) {
        setTimeout(() => {
            showUsernamePopup();
        }); //wa to show popup after it will be rendered
        return;
    }
    if (roomId) {
        connect(roomId, getUserId()!, getUserName()!);
    }
}

const showRoom = (): void => {
    (<any>document.getElementsByTagName("opa-messages")[0]).style.display = "block";
    (<any>document.getElementsByTagName("opa-send-control")[0]).style.display = "block";
    (<any>document.getElementsByTagName("opa-user-list")[0]).style.display = "block";
    (<any>document.getElementsByTagName("opa-header")[0]).setAttribute("room-exist", true);
    (<any>document.getElementsByTagName("opa-call")[0]).style.display = "block";
}

const hideRoom = (): void => {
    (<any>document.getElementsByTagName("opa-messages")[0]).style.display = "none";
    (<any>document.getElementsByTagName("opa-send-control")[0]).style.display = "none";
    (<any>document.getElementsByTagName("opa-user-list")[0]).style.display = "none";
    (<any>document.getElementsByTagName("opa-header")[0]).setAttribute("room-exist", false);
    (<any>document.getElementsByTagName("opa-call")[0]).style.display = "none";
}

const send = (message: string): void => WsService.send({userId: getUserId(), text: message});

let pc: RTCPeerConnection | undefined = undefined;
let localVideoElem: HTMLVideoElement | undefined = undefined;
let remoteVideoElem: HTMLVideoElement | undefined = undefined;
let localStream: MediaStream | undefined = undefined;

async function setupPeer() {
    localVideoElem = document.getElementById("localVideo") as HTMLVideoElement;
    remoteVideoElem = document.getElementById("remoteVideo") as HTMLVideoElement;

    pc = new RTCPeerConnection({
        iceServers: [{urls: ["stun:stun.l.google.com:19302"]}]
    });
    pc.onicecandidate = (e) => {
        // if (e.candidate && ws) {
        if (e.candidate) {
            send(JSON.stringify(
                {type: "ice", candidate: e.candidate.toJSON(), room: roomId}
            ));
        }
    };
    pc.ontrack = (e) => {
        if (remoteVideoElem) remoteVideoElem.srcObject = e.streams[0];
    };
    pc.ondatachannel = (ev) => {
        const dc = ev.channel;
        dc.onopen = () => console.log("DC opened (callee)");
        dc.onmessage = (e) => console.log("DC message:", e.data);
    };

    // Микрофон/камера:
    const stream = await navigator.mediaDevices.getUserMedia({audio: true, video: true});
    localStream = stream;
    stream.getTracks().forEach((t) => pc?.addTrack(t, stream));
    if (localVideoElem) {
        localVideoElem.srcObject = stream;
    }
}

const callPeer = async () => {
    if (!pc) await setupPeer();
    // if (!pc || !ws) return;
    const offer = await pc?.createOffer({offerToReceiveAudio: true, offerToReceiveVideo: true});
    await pc?.setLocalDescription(offer);
    send(JSON.stringify({type: "offer", sdp: offer?.sdp, room: roomId}));
};

const hangUpPeer = () => {
    pc?.getSenders().forEach((s) => s.track?.stop());
    pc?.close();
    pc = undefined;
    localStream?.getTracks().forEach((t) => t.stop());
};

// setupPeerConnection()
//     .then(() => console.info("Success setupPeerConnection"))
//     .catch(e => console.error("Failed setupPeerConnection:", e));

type SignalMessage =
    | { type: "offer"; sdp: string; room: string }
    | { type: "answer"; sdp: string; room: string }
    | { type: "ice"; candidate: RTCIceCandidateInit; room: string }
    | { type: "join"; room: string };

const connect = (roomId: string, userId: string, userName: string): void => {
    const wsRoomCallback: WsRoomCallback = {
        close(): void {
            console.log("ws close");
        },
        error(error: Error): void {
            console.error("WS error: ", error);
            showError();
        },
        async message(message: any): Promise<void> {
            const state: AppState = message;

            try {
                let lastMsg: any = state.messages[state.messages.length - 1].text;
                lastMsg = JSON.parse(lastMsg);
                if (lastMsg.type) {
                    const msg: SignalMessage = lastMsg;
                    if (msg.type === "offer") {
                        await pc?.setRemoteDescription({type: "offer", sdp: msg.sdp});
                        const answer = await pc?.createAnswer();
                        await pc?.setLocalDescription(answer);
                        send(JSON.stringify({type: "answer", sdp: answer?.sdp, room: roomId}));
                    } else if (msg.type === "answer") {
                        await pc?.setRemoteDescription({type: "answer", sdp: msg.sdp});
                    } else if (msg.type === "ice" && msg.candidate) {
                        try {
                            await pc?.addIceCandidate(msg.candidate);
                        } catch (e) {
                            console.error("ice failed:", e);
                        }
                    }
                }
            } catch (e) {
                //not needed message;
            }

            state.messages.map(msg => {
                if (msg.text.length > 1000) {
                    msg.text = msg.text.substring(0,1000) + "...";
                }
                return msg;
            })

            processStateChange(state);
        }
    }
    WsService.attachWsToRoom({roomId, userId, userName}, wsRoomCallback);
}

const showError = (): void => (window as any).wcToastError.show();

let callbacks: Function[] = [];
const processStateChange = (appState: AppState): void => callbacks.forEach(callback => callback(appState));
const onStateChange = (callback: Function): any => {
    callbacks.push(callback);
    return {unsubscribe: () => callbacks = callbacks.filter(item => item != callback)};
}

export const AppService = {
    createRoom,
    leaveRoom,
    getRoomId,

    getUserId,
    getUserName,

    showUsernamePopup,
    closeUsernamePopup,

    setNewUserId,
    setNewUserName,

    init,
    send,
    onStateChange,

    setupPeer,
    callPeer,
    hangUpPeer
}


