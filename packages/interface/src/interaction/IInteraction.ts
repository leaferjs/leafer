import { INumberFunction, IPointDataFunction } from '../function/IFunction'
import { IPointerEvent, IMoveEvent, IZoomEvent, IRotateEvent, IUIEvent, IKeyEvent } from '../event/IUIEvent'
import { ILeaf, ICursorType } from '../display/ILeaf'
import { ILeafList } from '../data/IList'
import { IClientPointData, IPointData } from '../math/IMath'
import { ISelector, IPickOptions, IPickBottom } from '../selector/ISelector'
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
    readonly transforming: boolean

    readonly moveMode: boolean
    readonly canHover: boolean

    readonly isDragEmpty: boolean
    readonly isMobileDragEmpty: boolean
    readonly isHoldMiddleKey: boolean
    readonly isHoldRightKey: boolean
    readonly isHoldSpaceKey: boolean

    config: IInteractionConfig

    cursor: ICursorType | ICursorType[]
    readonly hitRadius: number

    bottomList?: IPickBottom[] // 底部可拾取的虚拟元素

    shrinkCanvasBounds: IBounds

    downData: IPointerEvent
    hoverData: IPointerEvent
    downTime: number
    focusData: ILeaf

    receive(event: any): void

    pointerDown(data?: IPointerEvent, defaultPath?: boolean): void
    pointerMove(data?: IPointerEvent): void
    pointerMoveReal(data: IPointerEvent): void
    pointerUp(data?: IPointerEvent): void
    pointerCancel(): void

    multiTouch(data: IUIEvent, list: IKeepTouchData[]): void

    menu(data: IPointerEvent): void
    menuTap(data: IPointerEvent): void

    move(data: IMoveEvent): void
    zoom(data: IZoomEvent): void
    rotate(data: IRotateEvent): void

    keyDown(data: IKeyEvent): void
    keyUp(data: IKeyEvent): void

    findPath(data: IPointerEvent, options?: IPickOptions): ILeafList
    isRootPath(data: IPointerEvent): boolean
    isTreePath(data: IPointerEvent): boolean
    canMove(data: IPointerEvent): boolean

    isDrag(leaf: ILeaf): boolean
    isPress(leaf: ILeaf): boolean
    isHover(leaf: ILeaf): boolean
    isFocus(leaf: ILeaf): boolean

    cancelHover(): void

    updateDownData(data?: IPointerEvent, options?: IPickOptions, merge?: boolean): void
    updateHoverData(data: IPointerEvent): void

    updateCursor(hoverData?: IPointerEvent): void
    setCursor(cursor: ICursorType | ICursorType[]): void

    getLocal(clientPoint: IClientPointData, updateClient?: boolean): IPointData

    emit(type: string, data: IUIEvent, path?: ILeafList, excludePath?: ILeafList): void
}

export interface IInteractionCanvas extends ILeaferCanvas {

}

export interface IInteractionConfig {
    wheel?: IWheelConfig
    pointer?: IPointerConfig
    touch?: ITouchConfig
    multiTouch?: IMultiTouchConfig
    zoom?: IZoomConfig
    move?: IMoveConfig
    eventer?: IObject
    cursor?: boolean
    keyEvent?: boolean
}

export interface IZoomConfig {
    disabled?: boolean
    min?: number
    max?: number
}

export interface IMoveConfig {
    disabled?: boolean
    holdSpaceKey?: boolean
    holdMiddleKey?: boolean
    holdRightKey?: boolean
    scroll?: boolean | 'x' | 'y' | 'limit' | 'x-limit' | 'y-limit'
    drag?: boolean | 'auto'
    dragAnimate?: boolean
    dragEmpty?: boolean
    dragOut?: boolean | number
    autoDistance?: number
}

export interface IWheelConfig {
    disabled?: boolean
    zoomMode?: boolean | 'mouse'
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

    // mobile
    hover?: boolean
    touch?: boolean // 使用touch事件代替pointer事件

    dragHover?: boolean
    dragDistance?: number
    swipeDistance?: number
    ignoreMove?: boolean // 性能优化字段, 控制move事件触发次数
    preventDefault?: boolean
    preventDefaultMenu?: boolean
}

export interface ITouchConfig {
    preventDefault?: boolean | 'auto'
}

export interface IMultiTouchConfig {
    disabled?: boolean
}


export interface ICursorConfig {
    stop?: boolean
}