import { ILeafer } from '../app/ILeafer'
import { IEventer } from '../event/IEventer'

import { ILeaferCanvas, IHitCanvas } from '../canvas/ILeaferCanvas'
import { IRenderOptions } from '../renderer/IRenderer'

import { IObject, __Number, __Boolean, __Value, __String } from '../data/IData'
import { IMatrixWithBoundsData, IMatrix, IPointData, IBoundsData, IRadiusPointData, IMatrixDecompositionAttr, IMatrixWithLayoutData } from '../math/IMath'
import { IFunction } from '../function/IFunction'

import { ILeafDataProxy } from './module/ILeafDataProxy'
import { ILeafMatrix } from './module/ILeafMatrix'
import { ILeafBounds } from './module/ILeafBounds'
import { ILeafLayout, ILayoutBoundsType, ILayoutLocationType } from '../layout/ILeafLayout'
import { ILeafHit } from './module/ILeafHit'
import { ILeafRender } from './module/ILeafRender'
import { ILeafMask } from './module/ILeafMask'
import { ILeafData, ILeafDataOptions } from '../data/ILeafData'
import { IFindMethod } from '../selector/ISelector'


export interface ICachedLeaf {
    canvas: ILeaferCanvas,
    matrix?: IMatrix,
    bounds: IBoundsData
}


export interface ILeafAttrData {
    // layer data
    id: __String
    name: __String
    className: __String

    blendMode: IBlendMode
    opacity: __Number
    visible: __Boolean
    isMask: __Boolean
    isEraser: __Boolean
    zIndex: __Number

    // layout data
    x: __Number
    y: __Number
    width: __Number
    height: __Number
    scaleX: __Number
    scaleY: __Number
    rotation: __Number
    skewX: __Number
    skewY: __Number

    scale: __Number | IPointData // helper
    around: 'center' | IPointData

    draggable: __Boolean

    hittable: __Boolean
    hitFill: IHitType
    hitStroke: IHitType
    hitBox: __Boolean
    hitChildren: __Boolean
    hitSelf: __Boolean
    hitRadius: __Number

    cursor: ICursorType | ICursorType[]
}

export type IHitType =
    | 'path'
    | 'pixel'
    | 'all'
    | 'none'

export type IBlendMode =
    | 'pass-through'
    | 'normal'
    | 'multiply'
    | 'screen'
    | 'overlay'
    | 'darken'
    | 'lighten'
    | 'color-dodge'
    | 'color-burn'
    | 'hard-light'
    | 'soft-light'
    | 'difference'
    | 'exclusion'
    | 'hue'
    | 'saturation'
    | 'color'
    | 'luminosity'
    | 'source-over'  // other
    | 'source-in'
    | 'source-out'
    | 'source-atop'
    | 'destination-over'
    | 'destination-in'
    | 'destination-out'
    | 'destination-atop'
    | 'xor'

export type IResizeType = 'size' | 'scale'
export interface IImageCursor {
    url: string
    x?: number
    y?: number
}

export type IAround = 'center' | IPointData

export type ICursorType =
    | IImageCursor
    | ''
    | 'auto'
    | 'default'
    | 'none'
    | 'context-menu'
    | 'help'
    | 'pointer'
    | 'progress'
    | 'wait'
    | 'cell'
    | 'crosshair'
    | 'text'
    | 'vertical-text'
    | 'alias'
    | 'copy'
    | 'move'
    | 'no-drop'
    | 'not-allowed'
    | 'grab'
    | 'grabbing'
    | 'e-resize'
    | 'n-resize'
    | 'ne-resize'
    | 'nw-resize'
    | 's-resize'
    | 'se-resize'
    | 'sw-resize'
    | 'w-resize'
    | 'ew-resize'
    | 'ns-resize'
    | 'nesw-resize'
    | 'nwse-resize'
    | 'col-resize'
    | 'row-resize'
    | 'all-scroll'
    | 'zoom -in'
    | 'zoom-out'

export interface ICursorTypeMap {
    [name: string]: ICursorType | ICursorType[]
}
export interface ILeafInputData extends IObject {
    tag?: string

    // layer data
    id?: __String
    name?: __String
    className?: __String

    blendMode?: IBlendMode
    opacity?: __Number
    visible?: __Boolean
    isMask?: __Boolean
    isEraser?: __Boolean
    zIndex?: __Number

    // layout data
    x?: __Number
    y?: __Number
    width?: __Number
    height?: __Number
    scaleX?: __Number
    scaleY?: __Number
    rotation?: __Number
    skewX?: __Number
    skewY?: __Number

    scale?: __Number | IPointData // helper
    around?: IAround

    draggable?: __Boolean

    hittable?: __Boolean
    hitFill?: IHitType
    hitStroke?: IHitType
    hitBox?: __Boolean
    hitChildren?: __Boolean
    hitSelf?: __Boolean
    hitRadius?: __Number

    cursor?: ICursorType | ICursorType[]

    children?: ILeafInputData[]
}
export interface ILeafComputedData {
    // layer data
    id?: string
    name?: string
    className?: string

    blendMode?: IBlendMode
    opacity?: number
    visible?: boolean
    isMask?: boolean
    isEraser?: boolean
    zIndex?: number

    // layout data
    x?: number
    y?: number
    width?: number
    height?: number
    scaleX?: number
    scaleY?: number
    rotation?: number
    skewX?: number
    skewY?: number

    around?: IAround

    draggable?: boolean

    hittable?: boolean
    hitFill?: IHitType
    hitStroke?: IHitType
    hitBox?: boolean
    hitChildren?: boolean
    hitSelf?: boolean
    hitRadius?: number

    cursor?: ICursorType | ICursorType[]

    // other
    __childBranchNumber?: number // 存在子分支的个数
    __complex?: boolean // 外观是否复杂
    __naturalWidth?: number
    __naturalHeight?: number
}

export interface ILeaf extends ILeafMask, ILeafRender, ILeafHit, ILeafBounds, ILeafMatrix, ILeafDataProxy, ILeafInputData, IEventer {
    tag: string
    readonly __tag: string
    readonly innerName: string

    readonly __DataProcessor: IObject // IDataProcessor
    readonly __LayoutProcessor: IObject // ILeafLayout

    leafer?: ILeafer
    parent?: ILeaf

    readonly isApp?: boolean
    isLeafer?: boolean
    isBranch?: boolean
    isBranchLeaf?: boolean

    __: ILeafData
    proxyData?: ILeafInputData

    __layout: ILeafLayout

    __world: IMatrixWithLayoutData
    __local: IMatrixWithBoundsData

    __worldOpacity: number

    readonly worldTransform: IMatrixWithLayoutData
    readonly localTransform: IMatrixWithBoundsData

    readonly boxBounds: IBoundsData
    readonly worldBoxBounds: IBoundsData
    readonly worldStrokeBounds: IBoundsData
    readonly worldRenderBounds: IBoundsData

    readonly worldOpacity: number

    __level: number // 图层级别 root(1) -> hight
    __tempNumber?: number // 用于临时运算储存状态

    readonly resizeable: boolean

    readonly __hasMirror: boolean

    __hasMask?: boolean
    __hasEraser?: boolean
    __hitCanvas?: IHitCanvas

    readonly __onlyHitMask: boolean
    readonly __ignoreHitWorld: boolean

    __parentWait?: IFunction[]
    __leaferWait?: IFunction[]

    destroyed: boolean

    reset(data?: ILeafInputData): void
    resetCustom(): void

    waitParent(item: IFunction): void
    waitLeafer(item: IFunction): void
    nextRender(item: IFunction): void

    __bindLeafer(leafer: ILeafer | null): void

    set(data: IObject): void
    get(options?: ILeafDataOptions): ILeafInputData
    toJSON(): IObject
    toString(): string

    // ILeafData ->
    __setAttr(attrName: string, newValue: __Value): void
    __getAttr(attrName: string): __Value
    setProxyAttr(name: string, newValue: __Value): void
    getProxyAttr(name: string): __Value

    // find
    find(condition: number | string | IFindMethod): ILeaf[]
    findOne(condition: number | string | IFindMethod): ILeaf

    forceUpdate(attrName?: string): void

    // ILeafMatrix ->
    __updateWorldMatrix(): void
    __updateLocalMatrix(): void

    // ILeafBounds ->
    __updateWorldBounds(): void

    __updateLocalBoxBounds(): void
    __updateLocalStrokeBounds(): void
    __updateLocalRenderBounds(): void

    __updateBoxBounds(): void
    __updateStrokeBounds(): void
    __updateRenderBounds(): void

    __updateNaturalSize(): void

    __updateStrokeSpread(): number
    __updateRenderSpread(): number

    __onUpdateSize(): void

    // IBranchMask ->
    __updateEraser(value?: boolean): void
    __updateMask(value?: boolean): void
    __renderMask(canvas: ILeaferCanvas, content: ILeaferCanvas, mask: ILeaferCanvas, recycle?: boolean): void
    __removeMask(child?: ILeaf): void

    // convert
    getWorld(attrName: IMatrixDecompositionAttr): number
    getBounds(type: ILayoutBoundsType, locationType?: ILayoutLocationType): IBoundsData

    worldToLocal(world: IPointData, to?: IPointData, distance?: boolean, relative?: ILeaf): void
    localToWorld(local: IPointData, to?: IPointData, distance?: boolean, relative?: ILeaf): void
    worldToInner(world: IPointData, to?: IPointData, distance?: boolean, relative?: ILeaf): void
    innerToWorld(inner: IPointData, to?: IPointData, distance?: boolean, relative?: ILeaf): void

    getInnerPoint(world: IPointData, relative?: ILeaf, distance?: boolean, change?: boolean): IPointData
    getInnerPointByLocal(local: IPointData, relative?: ILeaf, distance?: boolean, change?: boolean): IPointData
    getLocalPoint(world: IPointData, relative?: ILeaf, distance?: boolean, change?: boolean): IPointData
    getLocalPointByInner(inner: IPointData, relative?: ILeaf, distance?: boolean, change?: boolean): IPointData
    getWorldPoint(inner: IPointData, relative?: ILeaf, distance?: boolean, change?: boolean): IPointData
    getWorldPointByLocal(local: IPointData, relative?: ILeaf, distance?: boolean, change?: boolean): IPointData

    move(x: number, y?: number): void
    scaleOf(origin: IPointData, x: number, y?: number): void
    rotateOf(origin: IPointData, rotation: number): void
    skewOf(origin: IPointData, x: number, y: number): void

    // ILeafHit ->
    __hitWorld(point: IRadiusPointData): boolean
    __hit(local: IRadiusPointData): boolean
    __drawHitPath(canvas: ILeaferCanvas): void
    __updateHitCanvas(): void

    // ILeafRender ->
    __render(canvas: ILeaferCanvas, options: IRenderOptions): void
    __drawFast(canvas: ILeaferCanvas, options: IRenderOptions): void
    __draw(canvas: ILeaferCanvas, options: IRenderOptions): void

    __renderShape(canvas: ILeaferCanvas, options: IRenderOptions): void

    __updateWorldOpacity(): void
    __updateChange(): void

    // path
    __drawPath(canvas: ILeaferCanvas): void
    __drawRenderPath(canvas: ILeaferCanvas): void
    __updatePath(): void
    __updateRenderPath(): void

    // branch
    children?: ILeaf[]

    __updateSortChildren(): void
    add(child: ILeaf, index?: number): void
    remove(child?: ILeaf, destroy?: boolean): void
}