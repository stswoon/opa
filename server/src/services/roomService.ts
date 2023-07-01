import {uniqueNamesGenerator, adjectives, colors, animals} from "unique-names-generator";
import {v4 as uuid} from "uuid";
import {JsMap, utils, WS} from "../utils";
import {Room, User} from "./roomModels";

const generateName = (): string => uniqueNamesGenerator({dictionaries: [adjectives, colors, animals]}); // big_red_donkey

//TODO: dblike
//TODO: interface to work with WS
//TODO: sync client\server models
//TODo: display room name
//TODO: ids with type
//TODO: remove room after 1 hour

export class RoomService {
    private readonly LAZY_REMOVE_TIMEOUT = 10 * 1000; //sec;
    private readonly room: Room;
    private readonly onDestroy: () => void;

    constructor(roomId: string, onDestroy: () => void) {
        this.room = {id: roomId, name: generateName(), users: [], messages: []};
        this.onDestroy = onDestroy;
    }

    private userWsConnections: JsMap<string, WS> = {};//<userId, WS>
    private userLazyRemoveTimers: JsMap<string, any> = {}; //userId, timeoutId

    joinRoom(ws: WS, userId: string, userName: string) {
        console.log(`User (${userId} : ${userName}) is entering in the room (${this.room.id} : ${this.room.name})`);

        if (this.userLazyRemoveTimers[userId]) {
            clearTimeout(this.userLazyRemoveTimers[userId]);
            delete this.userLazyRemoveTimers[userId];
        }

        const foundUser = this.getUser(userId);
        if (foundUser) {
            foundUser.name = userName;
            foundUser.active = true;
        } else {
            this.room.users.push({id: userId, name: userName, active: true});
            this.addMessage(`User "${userId}" was added`, "_system");
        }

        this.userWsConnections[userId] = ws;

        this.broadcastRoomState();
    }

    messageFromUser(userId: string, msg: string): void {
        if (msg === "H") {
            console.log(`Client send H (heartbeat), userId=${userId}`);
            return;
        }
        const parsedMsg = JSON.parse(msg);
        this.addMessage(parsedMsg.text, parsedMsg.userId);
        this.broadcastRoomState();
    }

    userDisconnect(userId: string): void {
        console.log(`WS for user (${userId}) in room (${this.room.id}) was closed`);
        delete this.userWsConnections[userId];
        const foundUser = this.getUser(userId)!;
        foundUser.active = false;
        this.broadcastRoomState();
        this.userLazyRemoveTimers[userId] = setTimeout(() => this.finalUserDisconnect(userId), this.LAZY_REMOVE_TIMEOUT);
    }

    private finalUserDisconnect(userId: string): void {
        console.log(`Finally remove user (${userId}) from room (${this.room.id})`);
        delete this.userLazyRemoveTimers[userId];
        this.room.users = this.room.users.filter(user => user.id !== userId);
        this.addMessage(`user "${userId}" left the room`, "_system");
        this.broadcastRoomState();

        if (Object.values(this.userWsConnections).length == 0) {
            setTimeout(() => {
                if (Object.values(this.userWsConnections).length == 0) {
                    console.log(`Finally remove roomService (${this.room.id})`);
                    this.onDestroy();
                }
            }, this.LAZY_REMOVE_TIMEOUT);
        }
    }

    private broadcastRoomState(): void {
        console.log(`Broadcast room (${this.room.id}) to users: ${Object.keys(this.userWsConnections).join(", ")}`);
        Object.values(this.userWsConnections).forEach((ws: WS) => ws.send(JSON.stringify(this.room)));
    }

    private addMessage(text: string, userId: string | "_system"): void {
        this.room.messages.push({id: uuid(), text, userId, date: utils.now()});
    }

    private getUser(id: string): User | null {
        return this.room.users.find(user => user.id === id)!;
    }
}


