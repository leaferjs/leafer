import { ILeaferBase } from '../app/ILeafer'
import { IEventer } from '../event/IEventer'

import { ILeaferCanvas, IHitCanvas } from '../canvas/ILeaferCanvas'
import { IRenderOptions } from '../renderer/IRenderer'

import { IObject, INumber, IBoolean, IValue, IString, IPathString, IFourNumber } from '../data/IData'
import { IMatrixWithBoundsData, IMatrix, IPointData, IBoundsData, IRadiusPointData, ILayoutAttr, ILayoutBoundsData, IMatrixData, IMatrixWithBoundsScaleData, IMatrixWithScaleData, IAutoBoxData, IUnitPointData } from '../math/IMath'
import { IFunction } from '../function/IFunction'

import { ILeafDataProxy } from './module/ILeafDataProxy'
import { ILeafMatrix } from './module/ILeafMatrix'
import { ILeafBounds } from './module/ILeafBounds'
import { ILeafLayout, IBoundsType, ILocationType } from '../layout/ILeafLayout'
import { ILeafHit } from './module/ILeafHit'
import { ILeafRender } from './module/ILeafRender'
import { ILeafData } from '../data/ILeafData'
import { IFindMethod } from '../selector/ISelector'
import { IPathCommandData } from '../path/IPathCommand'
import { IWindingRule, IPath2D } from '../canvas/ICanvas'


export interface ICachedLeaf {
    canvas: ILeaferCanvas,
    matrix?: IMatrix,
    bounds: IBoundsData
}


export interface ILeafAttrData {
    // layer data
    id: IString
    name: IString
    className: IString

    blendMode: IBlendMode
    opacity: INumber
    visible: IBoolean | 0 // 0 = display: none
    selected: IBoolean
    disabled: IBoolean
    locked: IBoolean
    zIndex: INumber

    mask: IBoolean | IMaskType
    eraser: IBoolean | IEraserType

    // layout data
    x: INumber
    y: INumber
    width: INumber
    height: INumber
    scaleX: INumber
    scaleY: INumber
    rotation: INumber
    skewX: INumber
    skewY: INumber

    scale: INumber | IPointData // helper

    offsetX: INumber
    offsetY: INumber
    scrollX: INumber
    scrollY: INumber

    origin: IAlign | IUnitPointData
    around: IAlign | IUnitPointData

    lazy: IBoolean
    pixelRatio: INumber

    path: IPathCommandData | IPathString
    windingRule: IWindingRule
    closed: IBoolean

    // auto layout
    flow: IFlowType
    padding: IFourNumber
    gap: IGap | IPointGap
    flowAlign: IFlowAlign | IFlowAxisAlign
    flowWrap: IFlowWrap
    itemBox: IFlowBoxType

    inFlow: IBoolean
    autoWidth: IAutoSize
    autoHeight: IAutoSize
    lockRatio: IBoolean
    autoBox: IAutoBoxData | IConstraint

    widthRange: IRangeSize
    heightRange: IRangeSize

    // interactive
    draggable: IBoolean | IAxis
    dragBounds?: IBoundsData | 'parent'

    editable: IBoolean

    hittable: IBoolean
    hitFill: IHitType
    hitStroke: IHitType
    hitBox: IBoolean
    hitChildren: IBoolean
    hitSelf: IBoolean
    hitRadius: INumber

    cursor: ICursorType | ICursorType[]

    normalStyle: ILeafInputData // restore hover / press / focus / selected / disabled style
    hoverStyle: ILeafInputData
    pressStyle: ILeafInputData
    focusStyle: ILeafInputData
    selectedStyle: ILeafInputData
    disabledStyle: ILeafInputData
}


export type IAxis = 'x' | 'y'

export type IAxisReverse = 'x-reverse' | 'y-reverse'

export type IFlowType = boolean | IAxis | IAxisReverse

export type IFlowBoxType = 'box' | 'stroke'

export type IGap = INumber | 'auto' | 'fit'

export interface IPointGap { x?: IGap, y?: IGap }

export type IAxisAlign = 'from' | 'center' | 'to'

export interface IFlowAxisAlign { content?: IFlowAlign, x?: IAxisAlign, y?: IAxisAlign }

export type IFlowWrap = boolean | 'reverse'

export type IAutoSize = IBoolean | INumber | IPercentData

export interface IRangeSize {
    min?: number
    max?: number
}

export interface IUnitData {
    type: 'percent' | 'px'
    value: number
}

export interface IPercentData extends IUnitData {
    type: 'percent'
}

export interface IConstraint {
    x: IConstraintType
    y: IConstraintType
}

export type IConstraintType = 'from' | 'center' | 'to' | 'from-to' | 'scale'

export type IHitType =
    | 'path'
    | 'pixel'
    | 'all'
    | 'none'

export type IMaskType =
    | 'path'
    | 'pixel'
    | 'clipping'

export type IEraserType =
    | 'path'
    | 'pixel'

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

export type IEditSize = 'size' | 'font-size' | 'scale'
export interface IImageCursor {
    url: string
    x?: number
    y?: number
    rotation?: number
}

export type IDirection =
    | 'top-left'
    | 'top'
    | 'top-right'
    | 'right'
    | 'bottom-right'
    | 'bottom'
    | 'bottom-left'
    | 'left'
    | 'center'

export type IAlign = IDirection

export type IBaseLineAlign =
    | 'baseline-left'
    | 'baseline-center'
    | 'baseline-right'

export type IFlowAlign =
    | IAlign
    | IBaseLineAlign


export type IAround =
    | IAlign
    | IUnitPointData

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
    | 'zoom-in'
    | 'zoom-out'

export type IStateStyleType =
    | 'hoverStyle'
    | 'pressStyle'
    | 'focusStyle'
    | 'selectedStyle'
    | 'disabledStyle'

export interface ILeafInputData {
    tag?: string

    // layer data
    id?: IString
    name?: IString
    className?: IString

    blendMode?: IBlendMode
    opacity?: INumber
    visible?: IBoolean | 0
    selected?: IBoolean
    disabled?: IBoolean
    locked?: IBoolean
    zIndex?: INumber

    mask?: IBoolean | IMaskType
    eraser?: IBoolean | IEraserType

    // layout data
    x?: INumber
    y?: INumber
    width?: INumber
    height?: INumber
    scaleX?: INumber
    scaleY?: INumber
    rotation?: INumber
    skewX?: INumber
    skewY?: INumber

    scale?: INumber | IPointData // helper

    offsetX?: INumber
    offsetY?: INumber
    scrollX?: INumber
    scrollY?: INumber

    origin?: IAlign | IUnitPointData
    around?: IAlign | IUnitPointData

    lazy?: IBoolean
    pixelRatio?: INumber

    path?: IPathCommandData | IPathString
    windingRule?: IWindingRule
    closed?: IBoolean

    // auto layout
    flow?: IFlowType
    padding?: IFourNumber
    gap?: IGap | IPointGap
    flowAlign?: IFlowAlign | IFlowAxisAlign
    flowWrap?: IFlowWrap
    itemBox?: IFlowBoxType

    inFlow?: IBoolean
    autoWidth?: IAutoSize
    autoHeight?: IAutoSize
    lockRatio?: IBoolean
    autoBox?: IAutoBoxData | IConstraint

    widthRange?: IRangeSize
    heightRange?: IRangeSize

    // interactive
    draggable?: IBoolean | IAxis
    dragBounds?: IBoundsData | 'parent'

    editable?: IBoolean

    hittable?: IBoolean
    hitFill?: IHitType
    hitStroke?: IHitType
    hitBox?: IBoolean
    hitChildren?: IBoolean
    hitSelf?: IBoolean
    hitRadius?: INumber

    cursor?: ICursorType | ICursorType[]

    normalStyle?: ILeafInputData
    hoverStyle?: ILeafInputData
    pressStyle?: ILeafInputData
    focusStyle?: ILeafInputData
    selectedStyle?: ILeafInputData
    disabledStyle?: ILeafInputData

    children?: ILeafInputData[]

    // other
    noBounds?: boolean
}
export interface ILeafComputedData {
    // layer data
    id?: string
    name?: string
    className?: string

    blendMode?: IBlendMode
    opacity?: number
    visible?: boolean | 0
    selected?: boolean
    disabled?: boolean
    locked?: boolean
    zIndex?: number

    mask?: boolean | IMaskType
    eraser?: boolean | IEraserType

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

    offsetX?: number
    offsetY?: number
    scrollX?: number
    scrollY?: number

    origin?: IAlign | IUnitPointData
    around?: IAlign | IUnitPointData

    lazy?: boolean
    pixelRatio?: number

    path?: IPathCommandData
    windingRule?: IWindingRule
    closed?: boolean

    // auto layout
    flow?: IFlowType
    padding?: IFourNumber
    gap?: IGap | IPointGap
    flowAlign?: IFlowAlign | IFlowAxisAlign
    flowWrap?: IFlowWrap
    itemBox?: IFlowBoxType

    inFlow?: boolean
    autoWidth?: IAutoSize
    autoHeight?: IAutoSize
    lockRatio?: boolean
    autoBox?: IAutoBoxData | IConstraint

    widthRange?: IRangeSize
    heightRange?: IRangeSize

    // interactive
    draggable?: boolean | IAxis
    dragBounds?: IBoundsData | 'parent'

    editable?: boolean

    hittable?: boolean
    hitFill?: IHitType
    hitStroke?: IHitType
    hitBox?: boolean
    hitChildren?: boolean
    hitSelf?: boolean
    hitRadius?: number

    cursor?: ICursorType | ICursorType[]

    normalStyle?: ILeafInputData
    hoverStyle?: ILeafInputData
    pressStyle?: ILeafInputData
    focusStyle?: ILeafInputData
    selectedStyle?: ILeafInputData
    disabledStyle?: ILeafInputData

    // other
    __childBranchNumber?: number // 存在子分支的个数
    __complex?: boolean // 外观是否复杂

    __naturalWidth?: number
    __naturalHeight?: number

    readonly __autoWidth?: boolean
    readonly __autoHeight?: boolean
    readonly __autoSide?: boolean
    readonly __autoSize?: boolean

    readonly __useNaturalRatio: boolean // 宽高存在一个值时，另一个自动值是否采用natural尺寸比例
    readonly __isLinePath: boolean
    readonly __blendMode: string

    __useArrow?: boolean
    __useEffect?: boolean

    __pathInputed?: number // 是否为输入path, 0：否，1：是，2：永远是（不自动检测）
    __pathForRender?: IPathCommandData
    __path2DForRender?: IPath2D
}

export interface ILeaf extends ILeafRender, ILeafHit, ILeafBounds, ILeafMatrix, ILeafDataProxy, ILeafInputData, IEventer {
    tag: string
    readonly __tag: string
    readonly innerName: string

    readonly __DataProcessor: IObject // IDataProcessor
    readonly __LayoutProcessor: IObject // ILeafLayout

    readonly app?: ILeaferBase
    leafer?: ILeaferBase
    parent?: ILeaf
    zoomLayer?: ILeaf

    readonly isApp?: boolean
    readonly isLeafer?: boolean
    readonly isBranch?: boolean
    readonly isBranchLeaf?: boolean
    readonly isOutside?: boolean // scrollBar ...

    __: ILeafData

    proxyData?: ILeafInputData
    __proxyData?: ILeafInputData

    syncEventer?: ILeaf // 同步触发一样事件的元素

    __layout: ILeafLayout

    __world: IMatrixWithBoundsScaleData
    __local?: IMatrixWithBoundsData

    __nowWorld?: IMatrixWithBoundsScaleData // use __world or __cameraWorld render
    __cameraWorld?: IMatrixWithBoundsScaleData // use camera matrix render

    readonly __localMatrix: IMatrixData
    readonly __localBoxBounds: IBoundsData

    __worldOpacity: number

    readonly worldTransform: IMatrixWithScaleData
    readonly localTransform: IMatrixData

    readonly boxBounds: IBoundsData
    readonly renderBounds: IBoundsData
    readonly worldBoxBounds: IBoundsData
    readonly worldStrokeBounds: IBoundsData
    readonly worldRenderBounds: IBoundsData

    readonly worldOpacity: number

    __level: number // 图层级别 root(1) -> hight
    __tempNumber?: number // 用于临时运算储存状态

    readonly __worldFlipped: boolean

    __hasAutoLayout?: boolean
    __hasMask?: boolean
    __hasEraser?: boolean
    __hitCanvas?: IHitCanvas

    __flowBounds?: IBoundsData // localBoxBounds or localStrokeBounds
    __widthGrow?: number
    __heightGrow?: number
    __hasGrow?: boolean

    readonly __onlyHitMask: boolean
    readonly __ignoreHitWorld: boolean

    readonly pathInputed: boolean

    __parentWait?: IFunction[]
    __leaferWait?: IFunction[]

    destroyed: boolean

    reset(data?: ILeafInputData): void
    resetCustom(): void

    waitParent(item: IFunction, bind?: IObject): void
    waitLeafer(item: IFunction, bind?: IObject): void
    nextRender(item: IFunction, bind?: IObject, off?: 'off'): void
    removeNextRender(item: IFunction): void

    __bindLeafer(leafer: ILeaferBase | null): void

    set(data: IObject): void
    get(name?: string | string[] | IObject): ILeafInputData | IValue
    toJSON(): IObject
    toString(): string
    toSVG(): string
    __SVG(data: IObject): void
    toHTML(): string

    // ILeafData ->
    __setAttr(attrName: string, newValue: IValue, checkFiniteNumber?: boolean): boolean
    __getAttr(attrName: string): IValue
    setProxyAttr(name: string, newValue: IValue): void
    getProxyAttr(name: string): IValue

    // find
    find(condition: number | string | IFindMethod, options?: any): ILeaf[]
    findTag(tag: string | string[]): ILeaf[]
    findOne(condition: number | string | IFindMethod, options?: any): ILeaf | undefined
    findId(id: number | string): ILeaf | undefined

    focus(value?: boolean): void
    forceUpdate(attrName?: string): void

    updateLayout(): void

    // ILeafMatrix ->
    __updateWorldMatrix(): void
    __updateLocalMatrix(): void

    // ILeafBounds ->
    __updateWorldBounds(): void
    __updateLocalBounds(): void

    __updateLocalBoxBounds(): void
    __updateLocalStrokeBounds(): void
    __updateLocalRenderBounds(): void

    __updateContentBounds(): void
    __updateBoxBounds(): void
    __updateStrokeBounds(): void
    __updateRenderBounds(): void

    __updateAutoLayout(): void
    __updateFlowLayout(): void
    __updateNaturalSize(): void

    __updateStrokeSpread(): number
    __updateRenderSpread(): number

    __onUpdateSize(): void

    // IBranchMask ->
    __updateEraser(value?: boolean): void
    __updateMask(value?: boolean): void
    __renderMask(canvas: ILeaferCanvas, options: IRenderOptions): void
    __renderEraser(canvas: ILeaferCanvas, options: IRenderOptions): void

    // convert
    __getNowWorld(options: IRenderOptions): IMatrixWithBoundsScaleData // when render use other matrix

    getWorld(attrName: ILayoutAttr): number // will remove
    getTransform(relative?: ILocationType | ILeaf): IMatrixData

    getBounds(type?: IBoundsType, relative?: ILocationType | ILeaf): IBoundsData
    getLayoutBounds(type?: IBoundsType, relative?: ILocationType | ILeaf, unscale?: boolean): ILayoutBoundsData

    getWorldBounds(inner: IBoundsData, relative?: ILeaf, change?: boolean): IBoundsData

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
    getPagePoint(world: IPointData, relative?: ILeaf, distance?: boolean, change?: boolean): IPointData
    getWorldPointByPage(page: IPointData, relative?: ILeaf, distance?: boolean, change?: boolean): IPointData


    // transform
    setTransform(transform?: IMatrixData, resize?: boolean): void
    transform(transform?: IMatrixData, resize?: boolean): void

    move(x: number | IPointData, y?: number): void
    scaleOf(origin: IPointData, scaleX: number, scaleY?: number, resize?: boolean): void
    rotateOf(origin: IPointData, rotation: number): void
    skewOf(origin: IPointData, skewX: number, skewY?: number, resize?: boolean): void

    transformWorld(worldTransform?: IMatrixData, resize?: boolean): void
    moveWorld(x: number | IPointData, y?: number): void
    scaleOfWorld(worldOrigin: IPointData, scaleX: number, scaleY?: number, resize?: boolean): void
    rotateOfWorld(worldOrigin: IPointData, rotation: number): void
    skewOfWorld(worldOrigin: IPointData, skewX: number, skewY?: number, resize?: boolean): void

    scaleResize(scaleX: number, scaleY: number, noResize?: boolean): void
    __scaleResize(scaleX: number, scaleY: number): void

    resizeWidth(width: number): void
    resizeHeight(height: number): void

    // ILeafHit ->
    __hitWorld(point: IRadiusPointData): boolean
    __hit(local: IRadiusPointData): boolean
    __hitFill(inner: IRadiusPointData): boolean
    __hitStroke(inner: IRadiusPointData, strokeWidth: number): boolean
    __hitPixel(inner: IRadiusPointData): boolean
    __drawHitPath(canvas: ILeaferCanvas): void
    __updateHitCanvas(): void

    // ILeafRender ->
    __render(canvas: ILeaferCanvas, options: IRenderOptions): void
    __drawFast(canvas: ILeaferCanvas, options: IRenderOptions): void
    __draw(canvas: ILeaferCanvas, options: IRenderOptions): void

    __clip(canvas: ILeaferCanvas, options: IRenderOptions): void
    __renderShape(canvas: ILeaferCanvas, options: IRenderOptions, ignoreFill?: boolean, ignoreStroke?: boolean): void

    __updateWorldOpacity(): void
    __updateChange(): void

    // path
    __drawPath(canvas: ILeaferCanvas): void
    __drawRenderPath(canvas: ILeaferCanvas): void
    __updatePath(): void
    __updateRenderPath(): void

    // 

    // branch
    children?: ILeaf[]

    __updateSortChildren(): void
    add(child: ILeaf, index?: number): void
    remove(child?: ILeaf, destroy?: boolean): void
    dropTo(parent: ILeaf, index?: number, resize?: boolean): void
}

export type ILeafAttrDescriptor = IObject & ThisType<ILeaf>

export interface ILeafAttrDescriptorFn {
    (key: string): ILeafAttrDescriptor
}
