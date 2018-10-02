export enum Action {
    //Connection
    initialise,
    disconnect,
    data,

    //Room
    roomCreate,
    roomJoin
}

export enum ResponseStatus {
    success,
    failed,
    waiting
}

export enum ResponseReason {
    //Connection
    clientNotInitialised,

    //Rooms
    noRoomExists,
    roomAlreadyExists,
    alreadyInARoom
}

export interface IResponse {
    status: ResponseStatus,
    reason: ResponseReason
}

export interface IAction {
    action: Action,
    id: number
}

export interface IClientInitAction extends IAction {
    name: string
}

export interface IRoomJoinAction extends IAction {
    name: string
}

export interface IRoomCreateAction extends IAction {
    name: string
}

export default class Actions {

}