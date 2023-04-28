import express, {NextFunction, Request, Response} from "express";
import expressWs from "express-ws";
import path from "path";
import roomsRoutes from "./controllers/roomsRoutes";
import {mongoConnect} from "./mongoConnect";
import {roomWsRoute} from "./controllers/roomWsRoute";

const PORT = process.env.PORT || 3000;
const app = express();
app.use(express.json());
const appWs = expressWs(app);

const unexpectedExceptionHandle = (cause: any) => console.error("Something went wrong: ", cause);
process.on("uncaughtException", unexpectedExceptionHandle);
process.on("unhandledRejection", unexpectedExceptionHandle);
app.use((error: Error, req: Request, res: Response, next: NextFunction): void => {
    unexpectedExceptionHandle(error);
    res.status(500).send("Server Error");
});

app.get("/health", (req: Request, res: Response) => res.send("OK"));

app.use("/api/rooms", roomsRoutes);
appWs.app.ws("/api/roomState", roomWsRoute);

app.use(express.static(__dirname + "/public", {extensions: ["html"]}));
app.get("/room", (req: Request, res: Response) => res.sendFile(path.join(__dirname + "/public/index.html")));

console.info("Application starting...")
mongoConnect()
    .then(() => app.listen(PORT, () => console.info(`Application listening on ${PORT}`)))
    .catch((e) => console.error("Failed to connect to DB: ", e));
