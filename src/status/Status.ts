export enum  StatusType{
    room,
    gamestate
}

export interface IStatus{
    type: StatusType
}

export interface IPlayerStatus extends IStatus{
    name: string
}

export interface IRoomStatus extends IStatus {
    players: IPlayerStatus[]
}

export interface IGamestate{

}