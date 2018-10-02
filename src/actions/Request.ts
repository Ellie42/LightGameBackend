import {IGamestate} from "../status/Status";

export enum Request {
    roomStatus,
    fullGameState
}

export interface IRequest {
    request: Request
    id: number
}

export interface IRequestResponse {
    response: Request
    id: number
}

export interface IFullGameStateResponse extends IRequestResponse {
    gamestate: IGamestate
}