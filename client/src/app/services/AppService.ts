import {v4 as uuid} from "uuid";
import {WsRoomCallback, WsService} from "./WsService";
import {ProcessMessageService} from "./ProcessMessageService";

const setUserId = (userId: string): void => localStorage.setItem("userId", userId);
const getUserId = (): string | null => localStorage.getItem("userId");
const setUserName = (userName: string): void => localStorage.setItem("userName", userName);
const getUserName = (): string | null => localStorage.getItem("userName");

const showUsernamePopup = (): void => {
    document.getElementById("opa-username-popup").setAttribute("username", getUserName() || "");
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
    roomId = null;
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
        }); //show popup after it will be rendered
        return;
    }
    if (roomId) {
        connect();
    }
}

const showRoom = (): void => {
    document.getElementsByTagName("opa-messages")[0].style.display = "block";
    document.getElementsByTagName("opa-send-control")[0].style.display = "block";
    document.getElementsByTagName("opa-user-list")[0].style.display = "block";
    document.getElementsByTagName("opa-create-room-info")[0].style.display = "none";
}

const hideRoom = (): void => {
    document.getElementsByTagName("opa-messages")[0].style.display = "none";
    document.getElementsByTagName("opa-send-control")[0].style.display = "none";
    document.getElementsByTagName("opa-user-list")[0].style.display = "none";
    document.getElementsByTagName("opa-create-room-info")[0].style.display = "block";
}

const send = (message: string): void => WsService.send({userId: getUserId(), text: message});

const connect = (): void => {
    const wsRoomCallback: WsRoomCallback = {
        close(): void {
            alert(close);
        },
        error(error: Error): void {
            alert(error.message);
        },
        message(message: any): void {
            ProcessMessageService.process(message);
        }
    }
    WsService.attachWsToRoom({roomId, userId: getUserId(), userName: getUserName()}, wsRoomCallback);
}

export const AppService = {
    createRoom,
    leaveRoom,
    getRoomId,
    setUserId,
    getUserId,
    setUserName,
    getUserName,
    showUsernamePopup,
    closeUsernamePopup,
    init,

    send
}


