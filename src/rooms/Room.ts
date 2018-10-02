import Client from "../Client";
import {EventType} from "../actions/Events";
import {IRoomStatus} from "../status/Status";

export default class Room {
    public host: Client;
    private _guests: Client[] = [];

    constructor(host: Client) {
        this.host = host;
    }

    close() {
        for (let guest of this._guests) {
            guest.room = undefined;
            guest.sendEvent(EventType.roomClosed);
        }

        this._guests = [];
    }

    async add(client: Client) {
        this._guests.push(client);
    }

    getStatus(): IRoomStatus {
        return {
            players: [
                this.clientToPlayerStatus(this.host),
                ...this._guests.map(this.clientToPlayerStatus)
            ]
        };
    }

    private clientToPlayerStatus({name}: Client) {
        return {
            name
        }
    }
}