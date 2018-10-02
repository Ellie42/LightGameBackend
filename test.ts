import * as WebSocket from "ws";
import {Action} from "./src/actions/Actions";

function connect() {
    let ws: WebSocket;

    try{
        ws = new WebSocket('ws://localhost:4545', {handshakeTimeout: 999999});
    }catch(e){
        setTimeout(connect, 1000);
        return;
    }

    const actions = {
        connect: {
            action: Action.roomJoin,
            host: 'qweasd'
        }
    };

    ws.on("open", () => {
        console.log("connected");
        ws.send(JSON.stringify(actions.connect));
    });

    ws.on("message", (data) => {
        console.log(data);
    });

    ws.on("close", () => {
        console.log("reconnecting");

        try{
            connect();
        }catch(e){
            setTimeout(connect, 1000);
        }
    });
}

try{
    connect();
}catch(e){
    setTimeout(connect, 1000);
}
