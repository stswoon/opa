import {WS} from "../utils"
import {now} from "mongoose";

//TODO: lazy_remove for ws disconnect
//TODO: interface to work with WS
//TODO: routers in server.ts
//TODO: macros (e.g. title) + hashsum (e.g. for js) in index.html

const LAZY_REMOVE_TIMEOUT = 10;//sec;


const roomWsMap = {};
const roomMap = {};

export const createOrJoinRoom = (ws: WS, roomId: string, userId: string, userName: string): void => {
    console.log(`User (${userName} : ${userId}) is entering in the room (${roomId})`);

    if (roomMap[roomId] == null) {
        roomMap[roomId] = {users: [], messages: []}
        roomWsMap[roomId] = {};
    }
    let room = roomMap[roomId];

    ws.on("message", function (msg: string) {
        if (msg === "H") {
            console.log(`client send heartbit H, userId=${userId}`);
        } else {
            const parsedMsg = JSON.parse(msg);
            room.messages.push({id: Math.random(), text: parsedMsg.text, userId: parsedMsg.userId, date: now().getTime()})
            broadcastRoom(roomId);
            //ws.send(JSON.stringify(room));
        }
    });
    ws.on("close", function () {
        console.log(`WS for user (${userName} : ${userId}) in room (${roomId}) was closed`);
    });
    ws.on("error", function (err: any) {
        console.error(`WS for user (${userName} : ${userId}) in room (${roomId}) was closed`, err);
    });

    if (!room.users.find(user => user.id === userId)) {
        room.users.push({id: userId, name: userName});
    }
    room.messages.push({id: Math.random(), text: `user "${userName}" was added`, userId: "_system", date: now().getTime()});
    roomWsMap[roomId][userId] = ws;
    broadcastRoom(roomId);
}

const broadcastRoom = (roomId): void => {
    const userWsMap = roomWsMap[roomId];
    console.log(`Broadcast room (${roomId}) to users: ${Object.keys(userWsMap).join(', ')}`);
    let room = roomMap[roomId];
    Object.values(userWsMap).forEach((ws: WS) => ws.send(JSON.stringify(room)));
}
