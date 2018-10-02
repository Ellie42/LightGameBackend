import Client from "../Client";

export default class ClientManager{
    public readonly clients: Client[];

    constructor(){
        this.clients = [];
        setInterval(this._timeoutClients.bind(this), 10000);
    }

    add(client: Client) {
        this.clients.push(client);
    }

    private _timeoutClients(){
        this.clients.forEach((client) => {
            if (!client.alive) {
                return client.disconnect();
            }

            client.ping();
        });
    }
}