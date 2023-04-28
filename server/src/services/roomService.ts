import { WS } from "../utils"

//TODO: lazy_remove for ws disconnect
//TODO: interface to work with WS
//TODO: routers in server.ts
//TODO: macros (e.g. title) + hashsum (e.g. for js) in index.html

const LAZY_REMOVE_TIMEOUT = 10;//sec;

export const createOrJoinRoom = (ws: WS, roomId: string, userId: string, userName: string): void => {
    console.log(`User (${userName} : ${userId}) is entering in the room (${roomId})`);

    ws.on("message", function (msg: string) {
        if (msg === "H") {
            console.log(`client send heartbit H, userId=${userId}`);
        }
    });
    ws.on("close", function () {
        console.log(`WS for user (${userName} : ${userId}) in room (${roomId}) was closed`);
    });
    ws.on("error", function (err: any) {
        console.error(`WS for user (${userName} : ${userId}) in room (${roomId}) was closed`, err);
    });
}
