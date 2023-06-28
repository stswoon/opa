import {JsMap, utils, WS} from "../utils"
import {v4 as uuid} from "uuid";
import {Room} from "./roomModels";

//TODO: dblike
//TODO: interface to work with WS


const LAZY_REMOVE_TIMEOUT = 10; //sec;
const userLateRemoveTimers: JsMap<string, any> = {}; //userId, timeoutId

const roomWsMap: JsMap<string, JsMap<string, WS>> = {}; //<roomId, <userId, WS>>
const roomMap: JsMap<string, Room> = {}; //roomId

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
            room.messages.push({id: uuid(), text: parsedMsg.text, userId: parsedMsg.userId, date: utils.now()})
            broadcastRoom(roomId);
        }
    });
    ws.on("close", function () {
        console.log(`WS for user (${userName} : ${userId}) in room (${roomId}) was closed`);

        const foundUser = room.users.find(user => user.id === userId);
        foundUser!.active = false;
        broadcastRoom(roomId);
        userLateRemoveTimers[userId] = setTimeout(() => {
            console.log(`Finally remove for user (${userName} : ${userId}) in room (${roomId}) was closed`);
            delete userLateRemoveTimers[userId];
            room.users = room.users.filter(user => user.id !== userId);
            room.messages.push({id: uuid(), text: `user "${userName}" left the room`, userId: "_system", date: utils.now()});
            broadcastRoom(roomId);
        }, LAZY_REMOVE_TIMEOUT * 1000);

        const isEmptyRoom = room.users.length === 0
        if (isEmptyRoom) {
            console.log(`Room (${roomId}) is empty so remove it`);
            delete roomMap[roomId];
            delete roomWsMap[roomId];
            //todo remove after hour;
        }
    });
    ws.on("error", function (err: any) {
        console.error(`WS for user (${userName} : ${userId}) in room (${roomId}) was closed`, err);
    });

    if (userLateRemoveTimers[userId]) {
        console.log(`Reconnect user (${userName} : ${userId}) in room (${roomId})`);
        clearTimeout(userLateRemoveTimers[userId]);
        delete userLateRemoveTimers[userId];
    } else {
        room.messages.push({id: uuid(), text: `user "${userName}" was added`, userId: "_system", date: utils.now()});
    }
    const foundUser = room.users.find(user => user.id === userId);
    if (foundUser) {
        foundUser.name = userName;
        foundUser.active = true;
    } else {
        room.users.push({id: userId, name: userName, active: true});
    }
    roomWsMap[roomId][userId] = ws;
    broadcastRoom(roomId);
}

const broadcastRoom = (roomId: string): void => {
    const userWsMap = roomWsMap[roomId];
    console.log(`Broadcast room (${roomId}) to users: ${Object.keys(userWsMap).join(', ')}`);
    let room = roomMap[roomId];
    Object.values(userWsMap).forEach((ws: WS) => ws.send(JSON.stringify(room)));
}
