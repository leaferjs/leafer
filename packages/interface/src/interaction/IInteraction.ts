import { INumberFunction, IPointDataFunction } from '../function/IFunction'
import { IPointerEvent, IMoveEvent, IZoomEvent, IRotateEvent, IUIEvent } from '../event/IUIEvent'
import { ILeaf } from '../display/ILeaf'
import { ILeafList } from '../data/IList'
import { IPointData } from '../math/IMath'
import { ISelector } from '../selector/ISelector'
import { ILeaferCanvas } from '../canvas/ILeaferCanvas'
import { IBounds } from '../math/IMath'

export interface IInteraction {
    target: ILeaf
    canvas: ILeaferCanvas
    selector: ISelector

    running: boolean
    readonly dragging: boolean

    config: IInteractionConfig

    readonly hitRadius: number
    shrinkCanvasBounds: IBounds

    downData: IPointerEvent

    start(): void
    stop(): void

    pointerDown(data: IPointerEvent): void
    pointerMove(data: IPointerEvent): void
    pointerMoveReal(data: IPointerEvent): void
    pointerUp(data: IPointerEvent): void
    pointerCancel(): void

    move(data: IMoveEvent): void
    zoom(data: IZoomEvent): void
    rotate(data: IRotateEvent): void

    emit(type: string, data: IUIEvent, path?: ILeafList, excludePath?: ILeafList): void

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
    delta?: IPointData  // 以chrome为基准, 鼠标滚动一格的距离
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
    ignoreMove: boolean // 性能优化字段, 控制move事件触发次数
}