import { INumberFunction, IPointDataFunction } from '../function/IFunction'
import { IPointerEvent, IMoveEvent, IZoomEvent, IRotateEvent, IUIEvent, IKeyEvent } from '../event/IUIEvent'
import { ILeaf } from '../display/ILeaf'
import { ILeafList } from '../data/IList'
import { IPointData } from '../math/IMath'
import { ISelector } from '../selector/ISelector'
import { IBounds } from '../math/IMath'
import { IControl } from '../control/IControl'
import { IKeepTouchData } from '../event/IEvent'
import { ILeaferCanvas } from '../canvas/ILeaferCanvas'
import { IObject } from '../data/IData'

export interface IInteraction extends IControl {
    target: ILeaf
    canvas: IInteractionCanvas
    selector: ISelector

    running: boolean
    readonly dragging: boolean

    config: IInteractionConfig

    readonly hitRadius: number
    shrinkCanvasBounds: IBounds

    downData: IPointerEvent
    hoverData: IPointerEvent
    downTime: number

    receive(event: any): void

    pointerDown(data: IPointerEvent, defaultPath?: boolean): void
    pointerMove(data: IPointerEvent): void
    pointerMoveReal(data: IPointerEvent): void
    pointerUp(data: IPointerEvent): void
    pointerCancel(): void

    multiTouch(data: IUIEvent, list: IKeepTouchData[]): void

    move(data: IMoveEvent): void
    zoom(data: IZoomEvent): void
    rotate(data: IRotateEvent): void

    keyDown(data: IKeyEvent): void
    keyUp(data: IKeyEvent): void
    keyPress(data: IKeyEvent): void

    updateCursor(): void

    emit(type: string, data: IUIEvent, path?: ILeafList, excludePath?: ILeafList): void
}

export interface IInteractionCanvas extends ILeaferCanvas {

}

export interface IInteractionConfig {
    wheel?: IWheelConfig
    pointer?: IPointerConfig
    zoom?: IZoomConfig
    move?: IMoveConfig
    eventer?: IObject
}

export interface IZoomConfig {
    min?: number
    max?: number
}

export interface IMoveConfig {
    dragEmpty?: boolean
    dragOut?: boolean
    autoDistance?: number
}

export interface IWheelConfig {
    zoomMode?: boolean
    zoomSpeed?: number // 取值范围 0 ～ 1, 默认0.5
    moveSpeed?: number
    rotateSpeed?: number // 取值范围 0 ～ 1, 默认0.5
    delta?: IPointData  // 以chrome为基准, 鼠标滚动一格的距离
    getScale?: INumberFunction
    getMove?: IPointDataFunction
    preventDefault?: boolean
}

export interface IPointerConfig {
    hitRadius?: number
    through?: boolean
    tapMore?: boolean
    tapTime?: number
    longPressTime?: number
    transformTime?: number
    dragHover?: boolean
    dragDistance?: number
    swipeDistance?: number
    ignoreMove?: boolean // 性能优化字段, 控制move事件触发次数
    preventDefault?: boolean
}