import express from 'express';
import expressWs from 'express-ws';
import {createOrJoinRoom} from './roomService';
import {WS} from './utils';
import path from "path";
import roomsRoutes from "./roomsRoutes";
import {mongoConnect} from "./mongoConnect";


const app = express();

const unexpectedExceptionHandle = (cause: any) => console.error("Something went wrong: ", cause);
process.on('uncaughtException', unexpectedExceptionHandle);
process.on('unhandledRejection', unexpectedExceptionHandle);
app.use((error: any, req: any, res: any, next: any): void => {
    unexpectedExceptionHandle(error);
    res.status(500).send("Server Error");
});

app.get('/health', (req, res) => res.send('OK'));
app.use(express.static(__dirname + '/public', {extensions: ['html']}));
app.get('/room', (req, res) => res.sendFile(path.join(__dirname + '/public/index.html')));

app.use("/rooms", roomsRoutes);

const appWs = expressWs(app);
appWs.app.ws('/api/roomState', (ws: WS, req: express.Request, next): void => {
    const {roomId, userId, userName} = req.query as { roomId: string, userId: string, userName: string };
    console.info(`WS request roomId=${roomId}, userId=${userId} userName=${userName}`);
    try {
        createOrJoinRoom(ws, roomId, userId, userName);
    } catch (error) {
        // https://scoutapm.com/blog/express-error-handling
        next(error); // passing to default middleware error handler
    }
});

mongoConnect().then(() => {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Listening on ${PORT}`));
}).catch((e) => {
    console.error("Failed to connect to db", e)
})

