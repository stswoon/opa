import express from 'express';
import expressWs from 'express-ws';
import path from "path";
import roomsRoutes from "./roomsRoutes";
import {mongoConnect} from "./mongoConnect";
import {roomWsRoute} from "./roomWsRoute";

const PORT = process.env.PORT || 3000;
const app = express();
app.use(express.json());
const appWs = expressWs(app);

const unexpectedExceptionHandle = (cause: any) => console.error("Something went wrong: ", cause);
process.on('uncaughtException', unexpectedExceptionHandle);
process.on('unhandledRejection', unexpectedExceptionHandle);
app.use((error: any, req: any, res: any, next: any): void => {
    unexpectedExceptionHandle(error);
    res.status(500).send("Server Error");
});

app.get('/health', (req, res) => res.send('OK'));

app.use("/api/rooms", roomsRoutes);
appWs.app.ws('/api/roomState', roomWsRoute);

app.use(express.static(__dirname + '/public', {extensions: ['html']}));
app.get('/room', (req, res) => res.sendFile(path.join(__dirname + '/public/index.html')));

mongoConnect()
    .then(() => app.listen(PORT, () => console.log(`Listening on ${PORT}`)))
    .catch((e) => console.error("Failed to connect to db", e))

