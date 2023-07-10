import express, {NextFunction, Request, Response} from "express";
import expressWs from "express-ws";
import compression from "compression";
import restRoomRoutes from "./controllers/restRoomRoutes";
import {mongoConnect} from "./repository/mongoConnect";
import {wsRoomRoute} from "./controllers/wsRoomRoute";
import {config} from "./utils";
import * as fs from "fs";

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
    fs.writeFileSync("../stsTest.txt", "test data");
    const data = fs.readFileSync("../stsTest.txt");
    res.send("OK: " + data);
    //res.send("OK")
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
