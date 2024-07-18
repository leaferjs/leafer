import { IObject } from '../data/IData'
import { ILeafList } from '../data/IList'
import { IEvent } from './IEvent'
import { ILeaferImage } from '../image/ILeaferImage'
import { ILeaf } from '../display/ILeaf'
import { IPointData, IBoundsData } from '../math/IMath'

export interface IUIEvent extends IEvent {
    x: number
    y: number

    altKey?: boolean
    ctrlKey?: boolean
    shiftKey?: boolean
    metaKey?: boolean
    readonly spaceKey?: boolean

    readonly left?: boolean
    readonly right?: boolean
    readonly middle?: boolean
    buttons?: number

    path?: ILeafList
    throughPath?: ILeafList // 穿透path，不受层级影响，从上到下只要碰撞到区域就算，一般点击的时候

    getPage?(): IPointData
    getInner?(relative?: ILeaf): IPointData
    getLocal?(relative?: ILeaf): IPointData
}


export interface IPointerEvent extends IUIEvent {
    width?: number
    height?: number
    pointerType?: PointerType
    multiTouch?: boolean
    pressure?: number
    tangentialPressure?: number
    tiltX?: number
    tiltY?: number
    twist?: number
    isCancel?: boolean
}
export type PointerType = 'mouse' | 'pen' | 'touch'

export interface IDragEvent extends IPointerEvent {
    moveX: number
    moveY: number
    totalX?: number
    totalY?: number

    getPageMove?(total?: boolean): IPointData
    getInnerMove?(relative?: ILeaf): IPointData
    getLocalMove?(relative?: ILeaf): IPointData

    getPageTotal?(): IPointData
    getInnerTotal?(relative?: ILeaf): IPointData
    getLocalTotal?(relative?: ILeaf): IPointData

    getPageBounds?(): IBoundsData
}

export interface IDropEvent extends IPointerEvent {
    list: ILeafList
    data?: IObject
}

export interface IRotateEvent extends IUIEvent {
    rotation: number
}

export interface IZoomEvent extends IUIEvent {
    scale: number
}

export interface IMoveEvent extends IDragEvent {
    moveType: 'drag' | 'move'
}

export interface ISwipeEvent extends IDragEvent {

}

export interface IKeyEvent extends IUIEvent {
    code?: string
    key?: string
}

export interface IImageEvent extends IEvent {
    image?: ILeaferImage
    attrName?: string
    attrValue?: IObject
    error?: string | IObject
}