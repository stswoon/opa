import {v4 as uuid} from "uuid";
import {WsRoomCallback, WsService} from "./WsService";
import {ProcessMessageService} from "./ProcessMessageService";

const setUserId = (userId: string): void => localStorage.setItem("userId", userId);
const getUserId = (): string | null => localStorage.getItem("userId");
const setUserName = (userName: string): void => localStorage.setItem("userName", userName);
const getUserName = (): string | null => localStorage.getItem("userName");

const showUsernamePopup = (): void => {
    document.getElementById("username-popup").setAttribute("username", getUserName() || "");
    (window as any).UIkit.modal("#changeUsernamePopup").show()
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
    if (getUserName() == null) {
        showUsernamePopup();
    }
    roomId = (new URL(location.href)).searchParams.get("room");
    if (roomId) {
        document.getElementById("opa-content").style.display = "flex";
        connect();
    }
}

const send = (message: string): void => WsService.send(message);

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
    init,

    send
}


