import {JsMap} from "../utils";
import {RoomService} from "./roomService";

const roomMap: JsMap<string, RoomService> = {};

export const RoomServiceManager = {
    getRoomService(roomId: string): RoomService {
        if (!Object.keys(roomMap).includes(roomId)) {
            roomMap[roomId] = new RoomService(roomId, () => {
                delete roomMap[roomId];
            });
        }
        return roomMap[roomId];
    }
}
