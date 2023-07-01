import {Router} from "express";
import {model, Schema, Document} from "mongoose";

interface Room extends Document {
    name: string;
    id: string;
}

const RoomSchema = new Schema({
    name: {type: String, unique: true},
    id: {type: String, unique: true}
});

const RoomModel = model<Room>("Room", RoomSchema);

const routes = Router();

routes.get("/", async (req, res) => {
    try {
        const rooms: Room[] = await RoomModel.find().exec() as Room[];
        return res.json(rooms);
    } catch (error) {
        console.error(error);
        return res.status(500).json({error: "Sorry, something went wrong"});
    }
});

routes.post("/", async (req, res) => {
    try {
        const room: Room = req.body as Room;
        const countryExists = await RoomModel.findOne({name: room.name,}).exec();
        if (countryExists) {
            return res.status(409).json({error: "There is already another country with this name"});
        }
        const newRoom = await RoomModel.create(room);
        return res.status(201).json(newRoom);
    } catch (error) {
        console.error(error);
        return res.status(500).json({error: "Sorry, something went wrong"});
    }
});

export default routes;
