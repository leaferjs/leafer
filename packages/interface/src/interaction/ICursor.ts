import { ICursorType } from '../display/ILeaf'


export interface ICursorTypeMap {
    [name: string]: ICursorType | ICursorType[]
}


export interface ICursorRotate {
    rotation?: number
    data?: string
}

export interface ICursorRotateMap {
    [name: string]: ICursorRotate
}