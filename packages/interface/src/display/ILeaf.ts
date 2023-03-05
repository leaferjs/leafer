import { ILeafer } from '../app/ILeafer'
import { IEventer } from '../event/IEventer'

import { ILeaferCanvas, IHitCanvas } from '../canvas/ILeaferCanvas'
import { IRenderOptions } from '../renderer/IRenderer'

import { IObject, __Number, __Boolean, __Value, __String } from '../data/IData'
import { IMatrixWithBoundsData, IMatrix, IBoundsData, IRadiusPointData } from '../math/IMath'
import { IFunction } from '../function/IFunction'

import { ILeafDataProxy } from './module/ILeafDataProxy'
import { ILeafMatrix } from './module/ILeafMatrix'
import { ILeafBounds } from './module/ILeafBounds'
import { ILeafLayout } from '../layout/ILeafLayout'
import { ILeafHit } from './module/ILeafHit'
import { ILeafRender } from './module/ILeafRender'
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

    opacity: __Number
    visible: __Boolean
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

    draggable: __Boolean
}

export interface ILeafInputData {
    // layer data
    id?: __String
    name?: __String
    className?: __String

    opacity?: __Number
    visible?: __Boolean
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

    draggable?: __Boolean
}
export interface ILeafComputedData {
    // layer data
    id?: string
    name?: string
    className?: string

    opacity?: number
    visible?: boolean
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

    draggable?: boolean
}

export interface ILeaf extends ILeafRender, ILeafHit, ILeafBounds, ILeafMatrix, ILeafDataProxy, ILeafInputData, IEventer {
    readonly tag: string
    readonly __DataProcessor: IObject // IDataProcessor
    readonly __LayoutProcessor: IObject // ILeafLayout

    leafer?: ILeafer
    root?: ILeaf
    parent?: ILeaf

    __interactionOff?: boolean
    __childrenInteractionOff?: boolean

    __isRoot?: boolean
    __isBranch?: boolean
    __isBranchLeaf?: boolean

    __: ILeafData
    __layout: ILeafLayout

    __relative: IMatrixWithBoundsData
    __world: IMatrixWithBoundsData

    __worldOpacity: number
    __renderTime: number // μs 1000微秒 = 1毫秒
    __complex: boolean // 外观是否复杂， 将调用__drawComplex()

    __level: number // 图层级别 root(1) -> hight
    __tempNumber?: number // 用于临时运算储存状态

    __hitCanvas?: IHitCanvas

    __parentWait?: IFunction[]

    __addParentWait(item: IFunction): void
    __runParentWait(): void

    __setAsLeafer(): void
    __setAsRoot(): void

    __bindRoot(root: ILeaf): void

    // ILeafData ->
    __set(attrName: string, newValue: __Value): void
    __get(attrName: string): __Value
    __updateAttr(attrName: string): void

    // ILeafMatrix ->
    __updateWorldMatrix(): void
    __updateRelativeMatrix(): void

    // ILeafBounds ->
    __updateWorldBounds(): void

    __updateRelativeBoxBounds(): void
    __updateRelativeEventBounds(): void
    __updateRelativeRenderBounds(): void

    __updateBoxBounds(): void
    __updateEventBounds(): void
    __updateRenderBounds(): void

    __updateEventBoundsSpreadWidth(): number
    __updateRenderBoundsSpreadWidth(): number

    __onUpdateSize(): void

    // ILeafHit ->
    __hitWorld(point: IRadiusPointData): boolean
    __hit(local: IRadiusPointData): boolean
    __updateHitCanvas(): void

    // ILeafRender ->
    __render(canvas: ILeaferCanvas, options: IRenderOptions): void
    __drawFast(canvas: ILeaferCanvas, options: IRenderOptions): void
    __draw(canvas: ILeaferCanvas, options: IRenderOptions): void

    __updateWorldOpacity(): void
    __updateChange(): void

    // path
    __drawPath(canvas: ILeaferCanvas): void
    __drawRenderPath(canvas: ILeaferCanvas): void
    __updatePath(): void
    __updateRenderPath(): void

    // branch
    children?: ILeaf[]
    __childBranchNumber?: number // 存在子分支的个数

    __updateSortChildren(): void
    add(child: ILeaf, index?: number): void
    remove(child?: ILeaf): void
}


