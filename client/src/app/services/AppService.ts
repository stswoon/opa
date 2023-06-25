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
    (<any>document.getElementsByTagName("opa-create-room-info")[0]).style.display = "none";
}

const hideRoom = (): void => {
    (<any>document.getElementsByTagName("opa-messages")[0]).style.display = "none";
    (<any>document.getElementsByTagName("opa-send-control")[0]).style.display = "none";
    (<any>document.getElementsByTagName("opa-user-list")[0]).style.display = "none";
    (<any>document.getElementsByTagName("opa-create-room-info")[0]).style.display = "block";
}

const send = (message: string): void => WsService.send({userId: getUserId(), text: message});

const connect = (roomId: string, userId: string, userName: string): void => {
    const wsRoomCallback: WsRoomCallback = {
        close(): void {
            console.log("ws close");
        },
        error(error: Error): void {
            console.error("WS error: ", error);
            showError();
        },
        message(message: any): void {
            const state: AppState = message;
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
    onStateChange
}


