import { INumberFunction, IPointDataFunction } from '../function/IFunction'
import { IPointerEvent, IMoveEvent, IZoomEvent, IRotateEvent } from '../event/IUIEvent'
import { ILeaf } from '../display/ILeaf'
import { IPointData } from '../math/IMath'

export interface IInteraction {
    target: ILeaf
    config: IInteractionConfig
    running: boolean

    pointerMoveIgnore: boolean

    start(): void
    stop(): void

    pointerDown(data: IPointerEvent): void
    pointerMove(data: IPointerEvent): void
    pointerUp(data: IPointerEvent): void
    pointerCancel(): void

    move(data: IMoveEvent): void
    zoom(data: IZoomEvent): void
    rotate(data: IRotateEvent): void

    destroy(): void
}

export interface IInteractionConfig {
    wheel?: IWheelConfig
    pointer?: IPointerConfig

}

export interface IWheelConfig {
    zoomMode?: boolean
    zoomSpeed?: number // 取值范围 0 ～ 1, 默认0.5
    moveSpeed?: number
    rotateSpeed?: number // 取值范围 0 ～ 1, 默认0.5
    delta?: IPointData
    getScale?: INumberFunction
    getMove?: IPointDataFunction
}

export interface IPointerConfig {
    hitRadius?: number
    through?: boolean
    clickTime?: number
    longPressTime?: number
    transformTime?: number
    dragDistance?: number
    swipeDistance?: number
    autoMoveDistance?: number
}