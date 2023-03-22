import { IEventer } from './IEventer'
import { IWatchEventData } from '../watcher/IWatcher'
import { ILayoutBlockData } from '../layouter/ILayouter'
import { ILeaf } from '../display/ILeaf'
import { IScreenSizeData } from '../math/IMath'

export interface IEvent {
    type: string
    target: IEventTarget
    current: IEventTarget

    bubbles?: boolean
    phase?: number

    isStopDefault: boolean
    isStop: boolean
    isStopNow: boolean
    stopDefault(): void
    stopNow(): void
    stop(): void
}

export interface IEventTarget extends IEventer {

}

export interface ILeaferEvent {

}

export interface IRenderEvent {

}

export interface IChildEvent extends IEvent {
    parent?: ILeaf
    child?: ILeaf
}

export interface IResizeEvent extends IEvent {
    readonly width: number
    readonly height: number
    readonly pixelRatio: number

    readonly bigger: boolean
    readonly smaller: boolean
    readonly samePixelRatio: boolean
    readonly old: IScreenSizeData
}

export interface IResizeEventListener {
    (event: IResizeEvent): void
}

export interface IUpdateEvent extends IEvent {

}

export interface IAttrEvent extends IEvent {
    readonly attrName: string
    readonly oldValue: unknown
    readonly newValue: unknown
}

export interface ILayoutEvent extends IEvent {
    readonly data: ILayoutBlockData[]
}

export interface IWatchEvent extends IEvent {
    readonly data: IWatchEventData
}

export interface ITransformEventData {
    x: number
    y: number
    scaleX: number
    scaleY: number
    rotation: number

    readonly zooming: boolean
    readonly moving: boolean
    readonly rotating: boolean
    readonly changing: boolean
}

export interface ITransformEvent extends IEvent, ITransformEventData {
    readonly x: number
    readonly y: number
    readonly scaleX: number
    readonly scaleY: number
    readonly rotation: number
}
export type TransformMode = 'move' | 'zoom' | 'rotate'