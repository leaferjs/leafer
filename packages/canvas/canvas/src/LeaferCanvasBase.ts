import { IBounds, ILeaferCanvas, ICanvasStrokeOptions, ILeaferCanvasConfig, IMatrixData, IBoundsData, IAutoBounds, IScreenSizeData, IResizeEventListener, IMatrixWithBoundsData, IPointData, InnerId, ICanvasManager, IWindingRule, IBlendMode, IExportImageType, IExportFileType, IBlob, ICursorType } from '@leafer/interface'
import { Bounds, BoundsHelper, IncrementId } from '@leafer/math'
import { Creator, Platform } from '@leafer/platform'
import { DataHelper } from '@leafer/data'
import { FileHelper } from '@leafer/file'
import { Debug } from '@leafer/debug'

import { Canvas } from './Canvas'


const temp = new Bounds()
const minSize: IScreenSizeData = { width: 1, height: 1, pixelRatio: 1 }
const debug = Debug.get('LeaferCanvasBase')

export const canvasSizeAttrs = ['width', 'height', 'pixelRatio']

export class LeaferCanvasBase extends Canvas implements ILeaferCanvas {

    declare public readonly innerId: InnerId

    public name: string

    public manager: ICanvasManager

    public pixelRatio: number
    public get pixelWidth(): number { return this.width * this.pixelRatio }
    public get pixelHeight(): number { return this.height * this.pixelRatio }

    public get allowBackgroundColor(): boolean { return this.view && this.parentView }

    public bounds: IBounds
    public clientBounds: IBoundsData

    public config: ILeaferCanvasConfig

    public autoLayout: boolean

    public view: any
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

        this.pixelRatio = pixelRatio
        this.config = config

        this.init()
    }

    public init(): void { }

    public __createContext(): void {
        this.context = this.view.getContext('2d')
        this.__bindContext()
    }

    public toBlob(type?: IExportFileType, quality?: number): Promise<IBlob> {
        return new Promise((resolve) => {
            const canvas = this.getSaveCanvas(type)
            Platform.origin.canvasToBolb(canvas.view, type, quality).then((blob) => {
                canvas.recycle()
                resolve(blob)
            }).catch((e) => {
                debug.error(e)
                resolve(null)
            })
        })
    }

    public toDataURL(type?: IExportImageType, quality?: number): string | Promise<string> {
        const canvas = this.getSaveCanvas(type)
        const data = Platform.origin.canvasToDataURL(canvas.view, type, quality)
        canvas.recycle()
        return data
    }

    public saveAs(filename: string, quality?: number): Promise<boolean> {
        return new Promise((resolve) => {
            const canvas = this.getSaveCanvas(FileHelper.fileType(filename))
            Platform.origin.canvasSaveAs(canvas.view, filename, quality).then(() => {
                canvas.recycle()
                resolve(true)
            }).catch((e) => {
                debug.error(e)
                resolve(false)
            })
        })
    }

    public getSaveCanvas(type: string): ILeaferCanvas {
        const { backgroundColor, bounds } = this as ILeaferCanvas
        const canvas = this.getSameCanvas()
        if (['jpg', 'jpeg'].includes(type)) canvas.fillWorld(bounds, '#FFFFFF')
        if (backgroundColor) canvas.fillWorld(bounds, backgroundColor)
        canvas.copyWorld(this)
        return canvas
    }


    public resize(size: IScreenSizeData): void {
        if (this.isSameSize(size)) return

        let takeCanvas: ILeaferCanvas
        if (this.context && !this.unreal && this.width) {
            takeCanvas = this.getSameCanvas()
            takeCanvas.copyWorld(this)
        }

        DataHelper.copyAttrs(this, size, canvasSizeAttrs)
        this.bounds = new Bounds(0, 0, this.width, this.height)
        this.pixelRatio || (this.pixelRatio = 1)

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

    public setWorld(matrix: IMatrixData, parentMatrix?: IMatrixData, onlyTranslate?: boolean): void {
        const { pixelRatio } = this
        const w = this.worldTransform
        if (parentMatrix) {

            if (onlyTranslate) {
                this.setTransform(
                    w.a = matrix.a * pixelRatio,
                    w.b = matrix.b * pixelRatio,
                    w.c = matrix.c * pixelRatio,
                    w.d = matrix.d * pixelRatio,
                    w.e = (matrix.e + parentMatrix.e) * pixelRatio,
                    w.f = (matrix.f + parentMatrix.f) * pixelRatio
                )
            } else {
                const { a, b, c, d, e, f } = parentMatrix
                this.setTransform(
                    w.a = ((matrix.a * a) + (matrix.b * c)) * pixelRatio,
                    w.b = ((matrix.a * b) + (matrix.b * d)) * pixelRatio,
                    w.c = ((matrix.c * a) + (matrix.d * c)) * pixelRatio,
                    w.d = ((matrix.c * b) + (matrix.d * d)) * pixelRatio,
                    w.e = (((matrix.e * a) + (matrix.f * c) + e)) * pixelRatio,
                    w.f = (((matrix.e * b) + (matrix.f * d) + f)) * pixelRatio
                )
            }

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
        this.strokeCap = options.strokeCap
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

    public copyWorldByReset(canvas: ILeaferCanvas, from?: IBoundsData, to?: IBoundsData, blendMode?: IBlendMode): void {
        this.resetTransform()
        this.copyWorld(canvas, from, to, blendMode)
        this.useWorldTransform()
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
        temp.copy(bounds).scale(this.pixelRatio)
        this.fillRect(temp.x, temp.y, temp.width, temp.height)
        if (blendMode) this.blendMode = 'source-over'
    }

    public strokeWorld(bounds: IBoundsData, color: string | object, blendMode?: IBlendMode): void {
        if (blendMode) this.blendMode = blendMode
        this.strokeStyle = color
        temp.copy(bounds).scale(this.pixelRatio)
        this.strokeRect(temp.x, temp.y, temp.width, temp.height)
        if (blendMode) this.blendMode = 'source-over'
    }

    public clearWorld(bounds: IBoundsData, ceilPixel?: boolean): void {
        temp.copy(bounds).scale(this.pixelRatio)
        if (ceilPixel) temp.ceil()
        this.clearRect(temp.x, temp.y, temp.width, temp.height)
    }

    public clipWorld(bounds: IBoundsData, ceilPixel?: boolean): void {
        this.beginPath()
        temp.copy(bounds).scale(this.pixelRatio)
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
    public getSameCanvas(useSameWorldTransform?: boolean): ILeaferCanvas {
        const { width, height, pixelRatio } = this

        const options = { width, height, pixelRatio }
        const canvas = this.manager ? this.manager.get(options) : Creator.canvas(options)

        canvas.save()

        if (useSameWorldTransform) canvas.useWorldTransform({ ...this.worldTransform })

        return canvas
    }

    public getBiggerCanvas(addWidth: number, addHeight: number): ILeaferCanvas {
        let { width, height, pixelRatio } = this
        if (addWidth) width += addWidth
        if (addHeight) height += addHeight

        const options = { width, height, pixelRatio }
        const canvas = this.manager ? this.manager.get(options) : Creator.canvas(options)

        canvas.save()
        return canvas
    }

    public recycle(): void {
        if (!this.recycled) {
            this.restore()
            this.manager ? this.manager.recycle(this) : this.destroy()
        }
    }

    public updateRender(): void { }

    public unrealCanvas(): void { }

    public destroy(): void {
        this.manager = this.view = this.parentView = null
    }
}