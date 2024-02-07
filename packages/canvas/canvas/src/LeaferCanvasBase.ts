import { IBounds, ILeaferCanvas, ICanvasStrokeOptions, ILeaferCanvasConfig, IExportOptions, IMatrixData, IBoundsData, IAutoBounds, IScreenSizeData, IResizeEventListener, IMatrixWithBoundsData, IPointData, InnerId, ICanvasManager, IWindingRule, IBlendMode, IExportImageType, IExportFileType, IBlob, ICursorType, ILeaferCanvasView } from '@leafer/interface'
import { Bounds, BoundsHelper, MatrixHelper, IncrementId } from '@leafer/math'
import { Creator, Platform } from '@leafer/platform'
import { DataHelper } from '@leafer/data'
import { FileHelper } from '@leafer/file'
import { Debug } from '@leafer/debug'

import { Canvas } from './Canvas'


const { copy } = MatrixHelper
const temp = new Bounds()
const minSize: IScreenSizeData = { width: 1, height: 1, pixelRatio: 1 }
const debug = Debug.get('LeaferCanvasBase')

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
        this.context = this.view.getContext('2d')
        this.__bindContext()
    }

    public export(filename: IExportFileType | string, options?: IExportOptions | number | boolean): string | Promise<any> {
        const { quality, blob } = FileHelper.getExportOptions(options)
        if (filename.includes('.')) {
            return this.saveAs(filename, quality)
        } else if (blob) {
            return this.toBlob(filename as IExportFileType, quality)
        } else {
            return this.toDataURL(filename as IExportImageType, quality)
        }
    }

    public toBlob(type?: IExportFileType, quality?: number): Promise<IBlob> {
        return new Promise((resolve) => {
            Platform.origin.canvasToBolb(this.view, type, quality).then((blob) => {
                resolve(blob)
            }).catch((e) => {
                debug.error(e)
                resolve(null)
            })
        })
    }

    public toDataURL(type?: IExportImageType, quality?: number): string | Promise<string> {
        return Platform.origin.canvasToDataURL(this.view, type, quality)
    }

    public saveAs(filename: string, quality?: number): Promise<boolean> {
        return new Promise((resolve) => {
            Platform.origin.canvasSaveAs(this.view, filename, quality).then(() => {
                resolve(true)
            }).catch((e) => {
                debug.error(e)
                resolve(false)
            })
        })
    }

    public resize(size: IScreenSizeData): void {
        if (this.isSameSize(size)) return

        let takeCanvas: ILeaferCanvas
        if (this.context && !this.unreal && this.width) {
            takeCanvas = this.getSameCanvas()
            takeCanvas.copyWorld(this)
        }

        DataHelper.copyAttrs(this.size, size, canvasSizeAttrs)
        this.size.pixelRatio || (this.size.pixelRatio = 1)

        this.bounds = new Bounds(0, 0, this.width, this.height)

        if (!this.unreal) {
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

    public hitFill(point: IPointData, fillRule?: IWindingRule): boolean {
        return fillRule ? this.context.isPointInPath(point.x, point.y, fillRule) : this.context.isPointInPath(point.x, point.y)
    }

    public hitStroke(point: IPointData, strokeWidth?: number): boolean {
        this.strokeWidth = strokeWidth
        return this.context.isPointInStroke(point.x, point.y)
    }


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
        temp.set(bounds).scale(this.pixelRatio)
        this.fillRect(temp.x, temp.y, temp.width, temp.height)
        if (blendMode) this.blendMode = 'source-over'
    }

    public strokeWorld(bounds: IBoundsData, color: string | object, blendMode?: IBlendMode): void {
        if (blendMode) this.blendMode = blendMode
        this.strokeStyle = color
        temp.set(bounds).scale(this.pixelRatio)
        this.strokeRect(temp.x, temp.y, temp.width, temp.height)
        if (blendMode) this.blendMode = 'source-over'
    }

    public clearWorld(bounds: IBoundsData, ceilPixel?: boolean): void {
        temp.set(bounds).scale(this.pixelRatio)
        if (ceilPixel) temp.ceil()
        this.clearRect(temp.x, temp.y, temp.width, temp.height)
    }

    public clipWorld(bounds: IBoundsData, ceilPixel?: boolean): void {
        this.beginPath()
        temp.set(bounds).scale(this.pixelRatio)
        if (ceilPixel) temp.ceil()
        this.rect(temp.x, temp.y, temp.width, temp.height)
        this.clip()

    }

    public clear(): void {
        const { pixelRatio } = this
        this.clearRect(0, 0, this.width * pixelRatio, this.height * pixelRatio)
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

    public updateRender(): void { }

    public unrealCanvas(): void { }

    public destroy(): void {
        this.manager = this.view = this.parentView = null
    }
}