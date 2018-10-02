import * as WebSocket from "ws";
import {Action} from "../actions/Actions";
import Client from "../Client";
import {IFullGameStateResponse, IRequestResponse, Request} from "../actions/Request";

export default class TestClient {
    public connection!: WebSocket;
    public client!: Client;

    public readonly name: string;

    constructor(name: string) {
        this.name = name;
    }

    async createClient() {
        this.connection = new WebSocket('ws://localhost:4545', {handshakeTimeout: 999999});

        return new Promise((resolve, reject) => {
            this.connection.on("open", () => {
                this.client = new Client(this.connection);
                this.init();
                resolve(this.client);
            });

            this.connection.on("message", (data: string) => {
                const json = JSON.parse(data);

                if (typeof json.request !== 'undefined' && json.request === Request.fullGameState) {
                    this.connection.send(JSON.stringify(<IFullGameStateResponse>{
                        response: json.request,
                        id: json.id,
                        gamestate: {}
                    }))
                }

                console.log(`testClient ${data}`);
            });

            this.connection.on("close", () => {
                console.log("client disconnected");
            });
        });
    }

    createRoom() {
        this.connection.send(JSON.stringify({action: Action.roomCreate, name: "qweasd"}));
    }

    private init() {
        this.connection.send(JSON.stringify({action: Action.initialise, name: this.name}))
    }

    joinRoom(name: string) {
        this.connection.send(JSON.stringify({action: Action.roomJoin, name: name}))
    }
}

export const testClient = new TestClient("SophieTestHost");

