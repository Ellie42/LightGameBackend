import * as WebSocket from "ws";
import RoomManager from "./rooms/RoomManager";
import Client from "./Client";
import TestClient, {testClient} from "./client/testclient";
import ClientManager from "./client/ClientManager";

(async function start() {
    const server = new WebSocket.Server({
        host: '0.0.0.0',
        port: 4545,
        perMessageDeflate: false
    });
    RoomManager.createSingleton(server);
    const clientManager = new ClientManager();

    server.on('connection', (ws: WebSocket) => {
        const client = new Client(ws);

        console.log('New client connected');

        clientManager.add(client);
    });

    await testClient.createClient();
    testClient.createRoom();

    const testGuest = new TestClient("TestGuest");
    await testGuest.createClient();
    testGuest.joinRoom("qweasd");
})();


