import {WS} from "../utils";
import express from "express";
import {RoomService} from "../services/roomService";
import {RoomServiceManager} from "../services/roomServiceManager"

export const wsRoomRoute = (ws: WS, req: express.Request, next: any): void => {
    try {
        const {roomId, userId, userName} = req.query as { roomId: string, userId: string, userName: string };
        console.info(`WS request roomId=${roomId}, userId=${userId} userName=${userName}`);

        const roomService: RoomService = RoomServiceManager.getRoomService(roomId);
        ws.on("message", (msg: string) => roomService.messageFromUser(userId, msg))
        ws.on("close", () => roomService.userDisconnect(userId));
        ws.on("error", (err: any) => {
            console.error(`WS error for user (${userName} : ${userId}) in room (${roomId}) was closed`, err);
        });
        roomService.joinRoom(ws, userId, userName);
    } catch (error) {
        // https://scoutapm.com/blog/express-error-handling
        next(error); // passing to default middleware error handler
    }
}
