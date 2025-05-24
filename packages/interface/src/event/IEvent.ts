import { IEventer } from './IEventer'
import { IWatchEventData } from '../watcher/IWatcher'
import { ILayoutBlockData } from '../layouter/ILayouter'
import { ILeaf } from '../display/ILeaf'
import { IScreenSizeData, IPointData } from '../math/IMath'
import { IObject } from '../data/IData'

export interface IEvent {
    origin?: IObject

    type?: string
    target?: IEventTarget
    current?: IEventTarget

    bubbles?: boolean
    phase?: number

    isStopDefault?: boolean
    isStop?: boolean
    isStopNow?: boolean
    stopDefault?(): void
    stopNow?(): void
    stop?(): void
}

export interface IEventTarget extends IEventer {

}

export interface ILeaferEvent {

}

export interface IRenderEvent {

}

export interface IAnimateEvent {

}

export interface IChildEvent extends IEvent {
    parent?: ILeaf
    child?: ILeaf
}

export interface IBoundsEvent extends IEvent {

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

export interface IPropertyEvent extends IEvent {
    readonly attrName: string
    readonly oldValue: unknown
    readonly newValue: unknown
}

export interface ILayoutEvent extends IEvent {
    readonly data: ILayoutBlockData[]
    readonly times: number
}

export interface IWatchEvent extends IEvent {
    readonly data: IWatchEventData
}

export interface IMultiTouchData {
    move: IPointData,
    scale: number,
    rotation: number,
    center: IPointData
}

export interface IKeepTouchData {
    from: IPointData
    to: IPointData
}