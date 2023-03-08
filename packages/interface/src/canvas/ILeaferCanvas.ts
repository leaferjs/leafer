import { IObject } from '../data/IData'
import { IBounds, IMatrixData, IBoundsData, IAutoBoundsData, IAutoBounds, IScreenSizeData, IMatrixWithBoundsData, IPointData } from '../math/IMath'
import { ICanvasRenderingContext2D, ICanvasFillRule, IPath2D, ITextMetrics, CanvasGradient, CanvasPattern } from './ICanvas'
import { IResizeEventListener } from '../event/IEvent'
import { ICanvasDrawPath } from './ICanvasPathDrawer'
import { InnerId } from '../event/IEventer'
import { ICanvasManager } from './ICanvasManager'

export interface ILeaferCanvasContext extends ICanvasRenderingContext2D {

}

export interface ILeaferCanvasConfig extends IAutoBoundsData {
    view?: string | IObject
    fill?: string
    pixelRatio?: number
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

export interface ICanvasAttr extends ICanvasStrokeOptions {

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

    fill(path?: IPath2D | ICanvasFillRule, rule?: ICanvasFillRule): void
    stroke(path?: IPath2D): void
    clip(path?: IPath2D | ICanvasFillRule, rule?: ICanvasFillRule): void

    fillRect(x: number, y: number, width: number, height: number): void
    strokeRect(x: number, y: number, width: number, height: number): void
    clearRect(x: number, y: number, width: number, height: number): void

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

    setStroke(strokeStyle: string | object, strokeWidth: number, options?: ICanvasStrokeOptions): void
    setShadow(x: number, y: number, blur: number, color?: string): void
    setBlur(blur: number): void


    setWorld(matrix: IMatrixData, parentMatrix?: IMatrixData): void


    hitPath(point: IPointData, fillRule?: string): boolean
    hitStroke(point: IPointData): boolean

    replaceBy(canvas: ILeaferCanvas, fromBounds?: IBoundsData, toBounds?: IBoundsData): void
    copy(canvas: ILeaferCanvas, fromBounds?: IBoundsData, toBounds?: IBoundsData, blendMode?: string): void
    copyWorldToLocal(canvas: ILeaferCanvas, fromWorld: IMatrixWithBoundsData, toLocalBounds: IBoundsData, blendMode?: string): void
    fillBounds(bounds: IBoundsData, color: string | object, blendMode?: string): void
    strokeBounds(bounds: IBoundsData, color: string | object, blendMode?: string): void
    clipBounds(bounds: IBoundsData): void
    clearBounds(bounds: IBoundsData): void
    clear(): void
}

export interface ILeaferCanvas extends ICanvasAttr, ICanvasMethod, ICanvasDrawPath {

    manager: ICanvasManager

    readonly innerId: InnerId

    width: number
    height: number

    pixelRatio: number
    readonly pixelWidth: number
    readonly pixelHeight: number

    bounds: IBounds

    view: unknown
    context: ILeaferCanvasContext

    recycled?: boolean

    debug(): void

    autoLayout(autoBounds: IAutoBounds, listener: IResizeEventListener): void
    stopAutoLayout(): void

    resize(size: IScreenSizeData): void
    pixel(num: number): number

    // other
    isSameSize(options: ILeaferCanvasConfig): boolean
    getSameCanvas(useSameTransform?: boolean): ILeaferCanvas
    getBiggerCanvas(addWidth: number, addHeight: number): ILeaferCanvas
    useSameTransform(canvas: ILeaferCanvas): void
    recycle(): void

    destroy(): void
}


export type IHitCanvas = ILeaferCanvas