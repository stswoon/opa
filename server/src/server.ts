import express, {NextFunction, Request, Response} from "express";
import expressWs from "express-ws";
import compression from "compression";
import restRoomRoutes from "./controllers/restRoomRoutes";
import {mongoConnect} from "./repository/mongoConnect";
import {wsRoomRoute} from "./controllers/wsRoomRoute";
import {config} from "./utils";
import * as fs from "fs";
import {glob} from "glob";

const PORT = process.env.PORT || 3000;
const app = express();
app.use(express.json());
app.use(compression())
const appWs = expressWs(app);

const unexpectedExceptionHandle = (cause: any) => console.error("Something went wrong: ", cause);
process.on("uncaughtException", unexpectedExceptionHandle);
process.on("unhandledRejection", unexpectedExceptionHandle);
app.use((error: Error, req: Request, res: Response, next: NextFunction): void => {
    unexpectedExceptionHandle(error);
    res.status(500).send("Server Error");
});

app.get("/health", (req: Request, res: Response) => {
    fs.writeFileSync(__dirname + "/../../stsTest.txt", "test data");
    setTimeout(async () => {
        const files = await glob(__dirname + '/../../**/stsTest.txt', { ignore: 'node_modules/**' })
        console.log(files);
        const data = fs.readFileSync(__dirname + "/../../stsTest.txt");
        console.log(data);
        // res.send("OK: " + data);
    }, 5000);
    res.send("OK")
});
const staticDir = __dirname + "/../../client/dist";
console.log("staticDir=" + staticDir);
app.use("/", express.static(staticDir, {maxAge: 10 * 365 * 24 * 60 * 60 * 1000})); //10 years

app.use("/api/rooms", restRoomRoutes); //for mongo
appWs.app.ws("/api/roomState", wsRoomRoute);

console.info("Application starting...");
(async () => {
    if (!config.isDisableMongo()) {
        console.log("Connecting to mongo");
        await mongoConnect();
    }
    app.listen(PORT, () => console.info(`Application listening on ${PORT}`));
})();
