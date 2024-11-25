import { IBounds, ILeaferCanvas, ICanvasStrokeOptions, ILeaferCanvasConfig, IExportOptions, IMatrixData, IBoundsData, IAutoBounds, IScreenSizeData, IResizeEventListener, IMatrixWithBoundsData, IPointData, InnerId, ICanvasManager, IWindingRule, IBlendMode, IExportImageType, IExportFileType, IBlob, ICursorType, ILeaferCanvasView, IRadiusPointData, IObject } from '@leafer/interface'
import { Bounds, tempBounds, BoundsHelper, MatrixHelper, IncrementId } from '@leafer/math'
import { Creator, Platform } from '@leafer/platform'
import { DataHelper } from '@leafer/data'

import { Canvas } from './Canvas'


const { copy } = MatrixHelper
const minSize: IScreenSizeData = { width: 1, height: 1, pixelRatio: 1 }

export const canvasSizeAttrs = ['width', 'height', 'pixelRatio']

export class LeaferCanvasBase extends Canvas implements ILeaferCanvas {

    declare public readonly innerId: InnerId

    public name: string

    public manager: ICanvasManager

    public size: IScreenSizeData = {} as IScreenSizeData

    public get width(): number { return this.size.width }
    public get height(): number { return this.size.height }

    public get pixelRatio(): number { return this.size.pixelRatio }
    public get pixelWidth(): number { return this.width * this.pixelRatio }
    public get pixelHeight(): number { return this.height * this.pixelRatio }

    public get allowBackgroundColor(): boolean { return this.view && this.parentView }

    public bounds: IBounds
    public clientBounds: IBoundsData

    public config: ILeaferCanvasConfig

    public autoLayout: boolean

    public view: ILeaferCanvasView
    public parentView: any

    public unreal?: boolean

    public recycled?: boolean

    public worldTransform: IMatrixData = {} as IMatrixData

    protected savedBlendMode: IBlendMode

    constructor(config?: ILeaferCanvasConfig, manager?: ICanvasManager) {
        super()
        if (!config) config = minSize
        if (!config.pixelRatio) config.pixelRatio = Platform.devicePixelRatio

        this.manager = manager
        this.innerId = IncrementId.create(IncrementId.CNAVAS)

        const { width, height, pixelRatio } = config
        this.autoLayout = !width || !height

        this.size.pixelRatio = pixelRatio
        this.config = config

        this.init()
    }

    public init(): void { }

    public __createContext(): void {
        const { view } = this
        const { contextSettings } = this.config
        this.context = contextSettings ? view.getContext('2d', contextSettings) : view.getContext('2d')
        this.__bindContext()
    }

    // @leafer-ui/export rewrite

    public export(_filename: IExportFileType | string, _options?: IExportOptions | number | boolean): string | Promise<any> { return undefined }

    public toBlob(_type?: IExportFileType, _quality?: number): Promise<IBlob> { return undefined }

    public toDataURL(_type?: IExportImageType, _quality?: number): string | Promise<string> { return undefined }

    public saveAs(_filename: string, _quality?: number): Promise<boolean> { return undefined }

    // ---

    public resize(size: IScreenSizeData): void {
        if (this.isSameSize(size)) return

        let takeCanvas: ILeaferCanvas
        if (this.context && !this.unreal && this.width) {
            takeCanvas = this.getSameCanvas()
            takeCanvas.copyWorld(this)
        }

        const s = this.size as IObject
        DataHelper.copyAttrs(s, size, canvasSizeAttrs)
        canvasSizeAttrs.forEach(key => s[key] || (s[key] = 1)) // fix: width = 0 or height = 0

        this.bounds = new Bounds(0, 0, this.width, this.height)

        if (this.context && !this.unreal) {
            this.updateViewSize()
            this.smooth = this.config.smooth
        }

        this.updateClientBounds()

        if (this.context && !this.unreal && takeCanvas) {
            this.clearWorld(takeCanvas.bounds)
            this.copyWorld(takeCanvas)
            takeCanvas.recycle()
        }
    }

    public updateViewSize(): void { }
    public updateClientBounds(): void { }
    public getClientBounds(update?: boolean): IBoundsData {
        if (update) this.updateClientBounds()
        return this.clientBounds || this.bounds
    }

    public startAutoLayout(_autoBounds: IAutoBounds, _listener: IResizeEventListener): void { }
    public stopAutoLayout(): void { }

    public setCursor(_cursor: ICursorType | ICursorType[]): void { }

    public setWorld(matrix: IMatrixData, parentMatrix?: IMatrixData): void {
        const { pixelRatio } = this
        const w = this.worldTransform
        if (parentMatrix) {

            const { a, b, c, d, e, f } = parentMatrix
            this.setTransform(
                w.a = ((matrix.a * a) + (matrix.b * c)) * pixelRatio,
                w.b = ((matrix.a * b) + (matrix.b * d)) * pixelRatio,
                w.c = ((matrix.c * a) + (matrix.d * c)) * pixelRatio,
                w.d = ((matrix.c * b) + (matrix.d * d)) * pixelRatio,
                w.e = (((matrix.e * a) + (matrix.f * c) + e)) * pixelRatio,
                w.f = (((matrix.e * b) + (matrix.f * d) + f)) * pixelRatio
            )

        } else {

            this.setTransform(
                w.a = matrix.a * pixelRatio,
                w.b = matrix.b * pixelRatio,
                w.c = matrix.c * pixelRatio,
                w.d = matrix.d * pixelRatio,
                w.e = matrix.e * pixelRatio,
                w.f = matrix.f * pixelRatio
            )
        }
    }

    public useWorldTransform(worldTransform?: IMatrixData): void {
        if (worldTransform) this.worldTransform = worldTransform
        const w = this.worldTransform
        if (w) this.setTransform(w.a, w.b, w.c, w.d, w.e, w.f)
    }

    public setStroke(color: string | object, strokeWidth: number, options?: ICanvasStrokeOptions): void {
        if (strokeWidth) this.strokeWidth = strokeWidth
        if (color) this.strokeStyle = color
        if (options) this.setStrokeOptions(options)
    }

    public setStrokeOptions(options: ICanvasStrokeOptions): void {
        this.strokeCap = options.strokeCap === 'none' ? 'butt' : options.strokeCap
        this.strokeJoin = options.strokeJoin
        this.dashPattern = options.dashPattern
        this.dashOffset = options.dashOffset
        this.miterLimit = options.miterLimit
    }

    public saveBlendMode(blendMode: IBlendMode): void {
        this.savedBlendMode = this.blendMode
        this.blendMode = blendMode
    }

    public restoreBlendMode(): void {
        this.blendMode = this.savedBlendMode
    }

    // @leafer-ui/interaction rewrite

    public hitFill(_point: IPointData, _fillRule?: IWindingRule): boolean { return true }

    public hitStroke(_point: IPointData, _strokeWidth?: number): boolean { return true }

    public hitPixel(_radiusPoint: IRadiusPointData, _offset?: IPointData, _scale = 1): boolean { return true }

    // ---

    public setWorldShadow(x: number, y: number, blur: number, color?: string): void {
        const { pixelRatio } = this
        this.shadowOffsetX = x * pixelRatio
        this.shadowOffsetY = y * pixelRatio
        this.shadowBlur = blur * pixelRatio
        this.shadowColor = color || 'black'
    }

    public setWorldBlur(blur: number): void {
        const { pixelRatio } = this
        this.filter = `blur(${blur * pixelRatio}px)`
    }


    public copyWorld(canvas: ILeaferCanvas, from?: IBoundsData, to?: IBoundsData, blendMode?: IBlendMode): void {
        if (blendMode) this.blendMode = blendMode
        if (from) {
            const { pixelRatio } = this
            if (!to) to = from
            this.drawImage(canvas.view as HTMLCanvasElement, from.x * pixelRatio, from.y * pixelRatio, from.width * pixelRatio, from.height * pixelRatio, to.x * pixelRatio, to.y * pixelRatio, to.width * pixelRatio, to.height * pixelRatio)
        } else {
            this.drawImage(canvas.view as HTMLCanvasElement, 0, 0)
        }
        if (blendMode) this.blendMode = 'source-over'
    }

    public copyWorldToInner(canvas: ILeaferCanvas, fromWorld: IMatrixWithBoundsData, toInnerBounds: IBoundsData, blendMode?: IBlendMode): void {
        if (blendMode) this.blendMode = blendMode
        if (fromWorld.b || fromWorld.c) {
            this.save()
            this.resetTransform()
            this.copyWorld(canvas, fromWorld, BoundsHelper.tempToOuterOf(toInnerBounds, fromWorld))
            this.restore()
        } else {
            const { pixelRatio } = this
            this.drawImage(canvas.view as HTMLCanvasElement, fromWorld.x * pixelRatio, fromWorld.y * pixelRatio, fromWorld.width * pixelRatio, fromWorld.height * pixelRatio, toInnerBounds.x, toInnerBounds.y, toInnerBounds.width, toInnerBounds.height)
        }
        if (blendMode) this.blendMode = 'source-over'
    }

    public copyWorldByReset(canvas: ILeaferCanvas, from?: IBoundsData, to?: IBoundsData, blendMode?: IBlendMode, onlyResetTransform?: boolean): void {
        this.resetTransform()
        this.copyWorld(canvas, from, to, blendMode)
        if (!onlyResetTransform) this.useWorldTransform() // restore world transform
    }

    public useMask(maskCanvas: ILeaferCanvas, fromBounds?: IBoundsData, toBounds?: IBoundsData): void {
        this.copyWorld(maskCanvas, fromBounds, toBounds, 'destination-in')
    }

    public useEraser(eraserCanvas: ILeaferCanvas, fromBounds?: IBoundsData, toBounds?: IBoundsData): void {
        this.copyWorld(eraserCanvas, fromBounds, toBounds, 'destination-out')
    }

    public fillWorld(bounds: IBoundsData, color: string | object, blendMode?: IBlendMode): void {
        if (blendMode) this.blendMode = blendMode
        this.fillStyle = color
        tempBounds.set(bounds).scale(this.pixelRatio)
        this.fillRect(tempBounds.x, tempBounds.y, tempBounds.width, tempBounds.height)
        if (blendMode) this.blendMode = 'source-over'
    }

    public strokeWorld(bounds: IBoundsData, color: string | object, blendMode?: IBlendMode): void {
        if (blendMode) this.blendMode = blendMode
        this.strokeStyle = color
        tempBounds.set(bounds).scale(this.pixelRatio)
        this.strokeRect(tempBounds.x, tempBounds.y, tempBounds.width, tempBounds.height)
        if (blendMode) this.blendMode = 'source-over'
    }

    public clearWorld(bounds: IBoundsData, ceilPixel?: boolean): void {
        tempBounds.set(bounds).scale(this.pixelRatio)
        if (ceilPixel) tempBounds.ceil()
        this.clearRect(tempBounds.x, tempBounds.y, tempBounds.width, tempBounds.height)
    }

    public clipWorld(bounds: IBoundsData, ceilPixel?: boolean): void {
        this.beginPath()
        tempBounds.set(bounds).scale(this.pixelRatio)
        if (ceilPixel) tempBounds.ceil()
        this.rect(tempBounds.x, tempBounds.y, tempBounds.width, tempBounds.height)
        this.clip()

    }

    public clear(): void {
        const { pixelRatio } = this
        this.clearRect(0, 0, this.width * pixelRatio + 2, this.height * pixelRatio + 2)
    }


    // other

    public isSameSize(size: IScreenSizeData): boolean {
        return this.width === size.width && this.height === size.height && this.pixelRatio === size.pixelRatio
    }

    // 需要有 manager变量
    public getSameCanvas(useSameWorldTransform?: boolean, useSameSmooth?: boolean): ILeaferCanvas {
        const canvas = this.manager ? this.manager.get(this.size) : Creator.canvas({ ...this.size })
        canvas.save()


        if (useSameWorldTransform) copy(canvas.worldTransform, this.worldTransform), canvas.useWorldTransform()
        if (useSameSmooth) canvas.smooth = this.smooth

        return canvas
    }

    public recycle(clearBounds?: IBoundsData): void {
        if (!this.recycled) {
            this.restore()
            clearBounds ? this.clearWorld(clearBounds, true) : this.clear()
            this.manager ? this.manager.recycle(this) : this.destroy()
        }
    }

    public updateRender(_bounds?: IBoundsData): void { }

    public unrealCanvas(): void { }

    public destroy(): void {
        this.manager = this.view = this.parentView = null
    }
}