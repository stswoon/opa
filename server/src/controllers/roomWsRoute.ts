import {WS} from "../utils";
import express from "express";
import {createOrJoinRoom} from "../services/roomService";

export const roomWsRoute = (ws: WS, req: express.Request, next: any): void => {
    const {roomId, userId, userName} = req.query as { roomId: string, userId: string, userName: string };
    console.info(`WS request roomId=${roomId}, userId=${userId} userName=${userName}`);
    try {
        createOrJoinRoom(ws, roomId, userId, userName);
    } catch (error) {
        // https://scoutapm.com/blog/express-error-handling
        next(error); // passing to default middleware error handler
    }
}
