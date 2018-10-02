import WebSocket = require("ws");
import {
    Action,
    IClientInitAction,
    IRoomCreateAction,
    IRoomJoinAction,
    ResponseReason,
    ResponseStatus
} from "./actions/Actions";
import Room from "./rooms/Room";
import {EventType} from "./actions/Events";
import RoomManager from "./rooms/RoomManager";
import {IFullGameStateResponse, IRequestResponse, Request} from "./actions/Request";
import {StatusType} from "./status/Status";

export default class Client {
    public initialised = false;
    public name!: string;
    public alive = true;
    public room?: Room;

    private _connection: WebSocket;
    private _requestId = 0;
    private _responsePromises = new Map<number, any>();

    constructor(connection: WebSocket) {
        this._connection = connection;

        this._connection.on('pong', () => {
            this.alive = true;
        });

        this._setupListeners();
    }

    sendResponse(status: ResponseStatus, reason: ResponseReason | null = null) {
        this._connection.send(JSON.stringify({
            status: status,
            reason: reason
        }))
    }

    init(data: IClientInitAction) {
        this.name = data.name;
        this.initialised = true;
    }

    ping() {
        this.alive = false;
        this._connection.ping();
    }

    disconnect() {
        if (this.room) {
            (<Room>this.room).close();
        }

        this._connection.close();
    }

    sendEvent(roomClosed: EventType) {
        this._connection.send(JSON.stringify({event: roomClosed}))
    }

    sendStatus(type: StatusType, status: any): any {
        this._connection.send(JSON.stringify({type, status}));
    }

    async requestFullGamestate(): Promise<IFullGameStateResponse> {
        const id = this._requestId++;
        this._connection.send(JSON.stringify({request: Request.fullGameState, id: id}));

        return await this.getResponse<IFullGameStateResponse>(id);
    }

    private _setupListeners() {
        this._connection.on('message', (message: WebSocket.Data) => {
            try {
                if (typeof message !== 'string') {
                    return;
                }

                const jsonMessage = JSON.parse(message);

                if (jsonMessage.response) {
                    this._handleResponse(<IRequestResponse>jsonMessage);
                    return;
                }

                if (typeof jsonMessage.action === 'undefined') {
                    return;
                }

                if (!this.initialised && jsonMessage.action !== Action.initialise) {
                    this.sendResponse(ResponseStatus.failed, ResponseReason.clientNotInitialised);
                    return;
                }

                switch (jsonMessage.action) {
                    case Action.roomCreate:
                        RoomManager.instance.create(<IRoomCreateAction>jsonMessage, this);
                        break;
                    case Action.roomJoin:
                        RoomManager.instance.join(<IRoomJoinAction>jsonMessage, this);
                        break;
                    case Action.initialise:
                        this.init(<IClientInitAction>jsonMessage);
                        break;
                }


            } catch (e) {
                console.error("Failed to parse message, invalid JSON");
                return;
            }
        });
    }

    private async getResponse<T>(id: number): Promise<T> {
        const promise = new Promise((resolve) => {
            this._responsePromises.set(id, resolve);
        });

        return (await promise) as T;
    }

    private _handleResponse(message: IRequestResponse) {
        if (!this._responsePromises.has(message.id)) {
            return;
        }

        const resolve = this._responsePromises.get(message.id);

        resolve(message);

        this._responsePromises.delete(message.id);
    }
}