let ws: WebSocket;

export interface WsRoomConfig {
    roomId: string;
    userId: string;
    userName: string;
}

export interface WsRoomCallback {
    message: (message: any) => void;
    close: () => void;
    error: (error: Error) => void;
}

const MAX_TRIES = 5;
const CONNECTION_TIMEOUT = 30 * 1000;
const PING_INTERVAL = 50 * 1000;

const attachWsToRoom = (wsRoomConfig: WsRoomConfig, wsRoomCallback: WsRoomCallback): void => {
    let wsTry = 0;

    const {roomId, userId, userName} = wsRoomConfig;
    const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
    ws = new WebSocket(`${wsProtocol}://${window.location.host}/api/roomState?roomId=${roomId}&userId=${userId}&userName=${userName}`);

    const wsConnectionTimeoutId = setTimeout(() => {
        console.error("Failed to connect WS after 30 sec");
        ws.close(5000, "Client 30 sec timeout");
    }, CONNECTION_TIMEOUT);

    let wsHeartbeatTimeoutId;

    ws.onopen = () => {
        console.info("WS connected");
        wsTry = 0;
        clearTimeout(wsConnectionTimeoutId);

        setTimeout(() => {
            console.log("ping");
            ws.send("H")
        }, PING_INTERVAL);
    };

    ws.onclose = (event: CloseEvent) => {
        clearTimeout(wsConnectionTimeoutId);
        clearTimeout(wsHeartbeatTimeoutId);
        console.debug(`WS error code ${event.code} and reason ${event.reason}`);
        if (event.wasClean) {
            console.info("WS closed normally");
            wsRoomCallback.close();
        } else {
            console.error("WS interrupted");
            if (wsTry < MAX_TRIES) {
                console.log("Try connect again");
                ++wsTry;
                setTimeout(() => attachWsToRoom(wsRoomConfig, wsRoomCallback), 1000);
            } else {
                console.error("SYSTEM ERROR: Can't connect to server, achieved max count of attempts");
                alert("SYSTEM ERROR: Can't connect to server");
                wsRoomCallback.error(new Error("SYSTEM ERROR: Can't connect to server"));
            }
        }
    };

    ws.onerror = (error: any) => {
        clearTimeout(wsHeartbeatTimeoutId);
        console.error("WS error:" + error.message);
        wsRoomCallback.error(new Error("WS error:" + error.message));
    }

    ws.onmessage = (event: MessageEvent) => {
        console.debug("WS data", event.data);
        if (event.data === "H") {
            console.debug("heart-bit");
        } else {
            wsRoomCallback.message(JSON.parse(event.data));
        }
    };
}

const send = (message: string): void => ws.send(message);

export const WsService = {
    attachWsToRoom
    send
};