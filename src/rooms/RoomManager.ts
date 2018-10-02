import {IRoomCreateAction, IRoomJoinAction, ResponseReason, ResponseStatus} from "../actions/Actions";
import Client from "../Client";
import Room from "./Room";
import {StatusType} from "../status/Status";
import WebSocket = require("ws");

export default class RoomManager {
    private _server: WebSocket.Server;
    private _rooms = new Map<string, Room>();
    public static instance: RoomManager;

    constructor(server: WebSocket.Server) {
        this._server = server;
    }

    async join(action: IRoomJoinAction, client: Client) {
        if (!this._rooms.has(action.name)) {
            client.sendResponse(ResponseStatus.failed, ResponseReason.noRoomExists);
            return;
        } else if (client.room) {
            client.sendResponse(ResponseStatus.failed, ResponseReason.alreadyInARoom);
            return;
        }

        const room = this._rooms.get(action.name) as Room;

        room.add(client);

        client.room = room;

        client.sendResponse(ResponseStatus.success);
        client.sendStatus(StatusType.room, room.getStatus());

        const data = await room.host.requestFullGamestate();

        client.sendStatus(StatusType.gamestate, data.gamestate);
    }

    create(action: IRoomCreateAction, client: Client) {
        if (this._rooms.has(action.name)) {
            client.sendResponse(ResponseStatus.failed, ResponseReason.roomAlreadyExists);
            return;
        }

        console.log(`${client.name} created room ${action.name}`);

        this._rooms.set(action.name, new Room(client));
    }

    static createSingleton(server: WebSocket.Server): RoomManager {
        RoomManager.instance = new RoomManager(server);

        return RoomManager.instance;
    }
}