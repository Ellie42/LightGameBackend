import * as WebSocket from "ws";
import {
    Action,
    IClientInitAction,
    IRoomCreateAction,
    IRoomJoinAction,
    ResponseReason,
    ResponseStatus
} from "./actions/Actions";
import RoomManager from "./rooms/RoomManager";
import Client from "./Client";
import TestClient, {testClient} from "./client/testclient";
import ClientManager from "./client/ClientManager";

(async function start(){
    const server = new WebSocket.Server({port: 4545});
    const roomManager = RoomManager.createSingleton(server);
    const clientManager = new ClientManager();

    server.on('connection', (ws: WebSocket) => {
        const client = new Client(ws);

        clientManager.add(client);
    });

    await testClient.createClient();
    testClient.createRoom();

    const testGuest = new TestClient("TestGuest");
    await testGuest.createClient();
    testGuest.joinRoom("qweasd");
})();


