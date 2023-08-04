import { IObject } from '../data/IData'
import { IBounds, IMatrixData, IBoundsData, IAutoBoundsData, IAutoBounds, IScreenSizeData, IMatrixWithBoundsData, IPointData } from '../math/IMath'
import { ICanvasContext2D, IWindingRule, IPath2D, ITextMetrics, CanvasGradient, CanvasPattern } from './ICanvas'
import { IResizeEventListener } from '../event/IEvent'
import { IPathDrawer } from '../path/IPathDrawer'
import { InnerId } from '../event/IEventer'
import { ICanvasManager } from './ICanvasManager'

export interface ILeaferCanvasConfig extends IAutoBoundsData {
    view?: string | IObject
    fill?: string
    pixelRatio?: number
    smooth?: boolean
    hittable?: boolean
    offscreen?: boolean
    webgl?: boolean
}

export type IHitCanvasConfig = ILeaferCanvasConfig

export interface ICanvasStrokeOptions {
    strokeWidth?: number
    strokeAlign?: string

    strokeCap?: string // lineCap
    strokeJoin?: string // lineJoin
    dashPattern?: number[] // lineDash
    dashOffset?: number // lineDashOffset
    miterLimit?: number
}

export interface ICanvasAttr extends ICanvasStrokeOptions, IObject {

    smooth: boolean // imageSmoothingEnabled: boolean
    smoothLevel: string // imageSmoothingQuality: string
    opacity: number // globalAlpha: number
    blendMode: string  // globalCompositeOperation: string

    fillStyle: string | object

    strokeStyle: string | object
    strokeWidth: number // lineWidth

    shadowBlur: number
    shadowColor: string
    shadowOffsetX: number
    shadowOffsetY: number

    filter: string

    font: string
    fontKerning: string
    fontStretch: string
    fontVariantCaps: string

    textAlign: string
    textBaseline: string
    textRendering: string
    wordSpacing: string
    letterSpacing: string

    direction: string
}

interface ICanvasMethod {
    save(): void
    restore(): void

    fill(path?: IPath2D | IWindingRule, rule?: IWindingRule): void
    stroke(path?: IPath2D): void
    clip(path?: IPath2D | IWindingRule, rule?: IWindingRule): void

    fillRect(x: number, y: number, width: number, height: number): void
    strokeRect(x: number, y: number, width: number, height: number): void
    clearRect(x: number, y: number, width: number, height: number): void

    transform(a: number, b: number, c: number, d: number, e: number, f: number): void
    translate(x: number, y: number): void
    scale(x: number, y: number): void
    rotate(angle: number): void

    drawImage(image: CanvasImageSource, dx: number, dy: number): void
    drawImage(image: CanvasImageSource, dx: number, dy: number, dw: number, dh: number): void
    drawImage(image: CanvasImageSource, sx: number, sy: number, sw: number, sh: number, dx: number, dy: number, dw: number, dh: number): void

    setTransform(a: number | IMatrixData, b?: number, c?: number, d?: number, e?: number, f?: number): void
    getTransform(): IMatrixData
    resetTransform(): void

    createConicGradient(startAngle: number, x: number, y: number): CanvasGradient
    createLinearGradient(x0: number, y0: number, x1: number, y1: number): CanvasGradient
    createPattern(image: CanvasImageSource, repetition: string | null): CanvasPattern | null
    createRadialGradient(x0: number, y0: number, r0: number, x1: number, y1: number, r1: number): CanvasGradient

    // text

    fillText(text: string, x: number, y: number, maxWidth?: number): void
    measureText(text: string): ITextMetrics
    strokeText(text: string, x: number, y: number, maxWidth?: number): void

    // custom

    saveBlendMode(blendMode?: string): void
    restoreBlendMode(): void

    hitFill(point: IPointData, fillRule?: string): boolean
    hitStroke(point: IPointData, strokeWidth?: number): boolean

    setStroke(strokeStyle: string | object, strokeWidth: number, options?: ICanvasStrokeOptions): void
    setStrokeOptions(options: ICanvasStrokeOptions): void

    setWorld(matrix: IMatrixData, parentMatrix?: IMatrixData): void

    setWorldShadow(x: number, y: number, blur: number, color?: string): void
    setWorldBlur(blur: number): void

    copyWorld(canvas: ILeaferCanvas, fromBounds?: IBoundsData, toBounds?: IBoundsData, blendMode?: string): void
    copyWorldToInner(canvas: ILeaferCanvas, fromWorld: IMatrixWithBoundsData, toInnerBounds: IBoundsData, blendMode?: string): void
    useMask(maskCanvas: ILeaferCanvas, fromBounds?: IBoundsData, toBounds?: IBoundsData): void
    useEraser(eraserCanvas: ILeaferCanvas, fromBounds?: IBoundsData, toBounds?: IBoundsData): void

    fillWorld(bounds: IBoundsData, color: string | object, blendMode?: string): void
    strokeWorld(bounds: IBoundsData, color: string | object, blendMode?: string): void
    clipWorld(bounds: IBoundsData, ceilPixel?: boolean): void
    clearWorld(bounds: IBoundsData, ceilPixel?: boolean): void

    clear(): void
}

export interface ILeaferCanvas extends ICanvasAttr, ICanvasMethod, IPathDrawer {

    readonly innerId: InnerId
    name: string

    manager: ICanvasManager

    width: number
    height: number

    pixelRatio: number
    readonly pixelWidth: number
    readonly pixelHeight: number

    readonly allowBackgroundColor?: boolean
    backgroundColor?: string
    hittable?: boolean

    bounds: IBounds
    clientBounds: IBoundsData

    config: ILeaferCanvasConfig

    autoLayout: boolean

    view: any
    parentView: any

    unreal?: boolean

    offscreen: boolean

    context: ICanvasContext2D

    recycled?: boolean

    worldTransform: IMatrixData

    init(): void

    toBlob(type?: string, quality?: number): Promise<IBlob>
    toDataURL(type?: string, quality?: number): string
    saveAs(filename: string, quality?: number): Promise<boolean>

    startAutoLayout(autoBounds: IAutoBounds, listener: IResizeEventListener): void
    stopAutoLayout(): void

    resize(size: IScreenSizeData): void
    updateViewSize(): void
    updateClientBounds(): void

    // other
    isSameSize(options: ILeaferCanvasConfig): boolean
    getSameCanvas(useSameWorldTransform?: boolean): ILeaferCanvas
    getBiggerCanvas(addWidth: number, addHeight: number): ILeaferCanvas
    recycle(): void

    unrealCanvas(): void
    destroy(): void
}


export interface IHitCanvas extends ILeaferCanvas {

}


export interface IBlobFunction {
    (blob: IBlob | null): void
}

export type IBlob = any