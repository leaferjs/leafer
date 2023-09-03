import { ILeafer } from '../app/ILeafer'
import { IEventer } from '../event/IEventer'

import { ILeaferCanvas, IHitCanvas } from '../canvas/ILeaferCanvas'
import { IRenderOptions } from '../renderer/IRenderer'

import { IObject, __Number, __Boolean, __Value, __String } from '../data/IData'
import { IMatrixWithBoundsData, IMatrix, IPointData, IBoundsData, IMatrixData, IRadiusPointData, IMatrixDecompositionAttr } from '../math/IMath'
import { IFunction } from '../function/IFunction'

import { ILeafDataProxy } from './module/ILeafDataProxy'
import { ILeafMatrix } from './module/ILeafMatrix'
import { ILeafBounds } from './module/ILeafBounds'
import { ILeafLayout, ILayoutBoundsType, ILayoutLocationType } from '../layout/ILeafLayout'
import { ILeafHit } from './module/ILeafHit'
import { ILeafRender } from './module/ILeafRender'
import { ILeafMask } from './module/ILeafMask'
import { ILeafData } from '../data/ILeafData'


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
    isEraser?: __Boolean
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

    byCenter: __Boolean | IPointData

    draggable: __Boolean

    hittable: __Boolean
    hitFill: IHitType
    hitStroke: IHitType
    hitChildren: __Boolean
    hitSelf: __Boolean
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

export interface ILeafInputData {
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

    byCenter?: __Boolean | IPointData

    draggable?: __Boolean

    hittable?: __Boolean
    hitFill?: IHitType
    hitStroke?: IHitType
    hitChildren?: __Boolean
    hitSelf?: __Boolean
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

    byCenter?: boolean | IPointData

    draggable?: boolean

    hittable?: boolean
    hitFill?: IHitType
    hitStroke?: IHitType
    hitChildren?: boolean
    hitSelf?: boolean

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
    __layout: ILeafLayout

    __local: IMatrixWithBoundsData
    __world: IMatrixWithBoundsData
    __worldOpacity: number

    readonly worldTransform: IMatrixData
    readonly localTransform: IMatrixData

    readonly worldBoxBounds: IBoundsData
    readonly worldStrokeBounds: IBoundsData
    readonly worldRenderBounds: IBoundsData

    readonly worldOpacity: number

    __renderTime?: number // μs 1000微秒 = 1毫秒

    __level: number // 图层级别 root(1) -> hight
    __tempNumber?: number // 用于临时运算储存状态

    __hasMask?: boolean
    __hasEraser?: boolean
    __hitCanvas?: IHitCanvas

    readonly __onlyHitMask: boolean
    readonly __ignoreHitWorld: boolean

    __parentWait?: IFunction[]
    __leaferWait?: IFunction[]

    destroyed: boolean

    waitParent(item: IFunction): void
    waitLeafer(item: IFunction): void

    __bindLeafer(leafer: ILeafer | null): void

    set(data: IObject): void
    get(attrNames?: string[]): IObject

    // ILeafData ->
    __setAttr(attrName: string, newValue: __Value): void
    __getAttr(attrName: string): __Value

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

    __updateStrokeSpread(): number
    __updateRenderSpread(): number

    __onUpdateSize(): void

    // IBranchMask ->
    __updateEraser(value?: boolean): void
    __updateMask(value?: boolean): void
    __renderMask(canvas: ILeaferCanvas, content: ILeaferCanvas, mask: ILeaferCanvas): void
    __removeMask(child?: ILeaf): void

    // convert
    getWorld(attrName: IMatrixDecompositionAttr): number
    getBounds(type: ILayoutBoundsType, locationType?: ILayoutLocationType): IBoundsData

    worldToLocal(world: IPointData, to?: IPointData, isMovePoint?: boolean): void
    localToWorld(local: IPointData, to?: IPointData, isMovePoint?: boolean): void
    worldToInner(world: IPointData, to?: IPointData, isMovePoint?: boolean): void
    innerToWorld(inner: IPointData, to?: IPointData, isMovePoint?: boolean): void

    move(x: number, y?: number): void
    scaleOf(origin: IPointData, x: number, y?: number): void
    rotateOf(origin: IPointData, rotation: number): void

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