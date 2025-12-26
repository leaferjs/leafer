import { IBounds, ILeaferCanvas, ICanvasStrokeOptions, ILeaferCanvasConfig, IWindingRuleData, IExportOptions, IMatrixData, IBoundsData, IAutoBounds, IScreenSizeData, IResizeEventListener, IMatrixWithBoundsData, IPointData, InnerId, ICanvasManager, IWindingRule, IBlendMode, IExportImageType, IExportFileType, IBlob, ICursorType, ILeaferCanvasView, IRadiusPointData, IObject, IMatrixWithOptionHalfData } from '@leafer/interface'
import { Bounds, BoundsHelper, MatrixHelper, IncrementId } from '@leafer/math'
import { Creator, Platform } from '@leafer/platform'
import { DataHelper, isUndefined } from '@leafer/data'

import { Canvas } from './Canvas'


const { copy, multiplyParent, pixelScale } = MatrixHelper, { round } = Math, tempPixelBounds = new Bounds(), tempPixelBounds2 = new Bounds()
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
    public get pixelWidth(): number { return this.width * this.pixelRatio || 0 } // 防止出现 NaN
    public get pixelHeight(): number { return this.height * this.pixelRatio || 0 }

    public get pixelSnap(): boolean { return this.config.pixelSnap }
    public set pixelSnap(value: boolean) { this.config.pixelSnap = value }

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

        this.manager = manager
        this.innerId = IncrementId.create(IncrementId.CNAVAS)

        const { width, height, pixelRatio } = config
        this.autoLayout = !width || !height

        this.size.pixelRatio = pixelRatio || Platform.devicePixelRatio
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

    // @leafer-in/export rewrite

    public export(_filename: IExportFileType | string, _options?: IExportOptions | number | boolean): string | Promise<any> { return undefined }

    public toBlob(_type?: IExportFileType, _quality?: number): Promise<IBlob> { return undefined }

    public toDataURL(_type?: IExportImageType, _quality?: number): string | Promise<string> { return undefined }

    public saveAs(_filename: string, _quality?: number): Promise<boolean> { return undefined }

    // ---

    public resize(size: IScreenSizeData, safeResize = true): void {
        if (this.isSameSize(size)) return

        let takeCanvas: ILeaferCanvas
        if (this.context && !this.unreal && safeResize && this.width) {
            takeCanvas = this.getSameCanvas()
            takeCanvas.copyWorld(this)
        }

        const s = this.size as IObject
        DataHelper.copyAttrs(s, size, canvasSizeAttrs)
        canvasSizeAttrs.forEach(key => s[key] || (s[key] = 1)) // fix: width = 0 or height = 0

        this.bounds = new Bounds(0, 0, this.width, this.height)

        this.updateViewSize()
        this.updateClientBounds()

        if (this.context) {

            this.smooth = this.config.smooth

            if (!this.unreal && takeCanvas) {
                this.clearWorld(takeCanvas.bounds)
                this.copyWorld(takeCanvas)
                takeCanvas.recycle()
            }

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

    public setWorld(matrix: IMatrixWithOptionHalfData, parentMatrix?: IMatrixData): void {
        const { pixelRatio, pixelSnap } = this, w = this.worldTransform

        if (parentMatrix) multiplyParent(matrix, parentMatrix, w)
        pixelScale(matrix, pixelRatio, w)

        if (pixelSnap && !matrix.ignorePixelSnap) {
            if (matrix.half && (matrix.half * pixelRatio) % 2) w.e = round(w.e - 0.5) + 0.5, w.f = round(w.f - 0.5) + 0.5
            else w.e = round(w.e), w.f = round(w.f)
        }

        this.setTransform(w.a, w.b, w.c, w.d, w.e, w.f)
    }

    public useWorldTransform(worldTransform?: IMatrixData): void {
        if (worldTransform) this.worldTransform = worldTransform
        const w = this.worldTransform
        if (w) this.setTransform(w.a, w.b, w.c, w.d, w.e, w.f)
    }

    public setStroke(color: string | object, strokeWidth: number, options?: ICanvasStrokeOptions, childOptions?: ICanvasStrokeOptions): void {
        if (strokeWidth) this.strokeWidth = strokeWidth
        if (color) this.strokeStyle = color
        if (options) this.setStrokeOptions(options, childOptions)
    }

    public setStrokeOptions(options: ICanvasStrokeOptions, childOptions?: ICanvasStrokeOptions): void {
        let { strokeCap, strokeJoin, dashPattern, dashOffset, miterLimit } = options
        if (childOptions) {
            if (childOptions.strokeCap) strokeCap = childOptions.strokeCap
            if (childOptions.strokeJoin) strokeJoin = childOptions.strokeJoin
            if (!isUndefined(childOptions.dashPattern)) dashPattern = childOptions.dashPattern
            if (!isUndefined(childOptions.dashOffset)) dashOffset = childOptions.dashOffset
            if (childOptions.miterLimit) miterLimit = childOptions.miterLimit
        }
        this.strokeCap = strokeCap
        this.strokeJoin = strokeJoin
        this.dashPattern = dashPattern
        this.dashOffset = dashOffset
        this.miterLimit = miterLimit
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


    public copyWorld(canvas: ILeaferCanvas, from?: IBoundsData, to?: IBoundsData, blendMode?: IBlendMode, ceilPixel?: boolean): void {
        if (blendMode) this.blendMode = blendMode
        if (from) {
            this.setTempPixelBounds(from, ceilPixel)
            if (!to) to = tempPixelBounds // to = from
            else this.setTempPixelBounds2(to, ceilPixel), to = tempPixelBounds2

            this.drawImage(canvas.view as HTMLCanvasElement, tempPixelBounds.x, tempPixelBounds.y, tempPixelBounds.width, tempPixelBounds.height, to.x, to.y, to.width, to.height)
        } else {
            this.drawImage(canvas.view as HTMLCanvasElement, 0, 0)
        }
        if (blendMode) this.blendMode = 'source-over'
    }

    public copyWorldToInner(canvas: ILeaferCanvas, fromWorld: IMatrixWithBoundsData, toInnerBounds: IBoundsData, blendMode?: IBlendMode, ceilPixel?: boolean): void {
        if (fromWorld.b || fromWorld.c) {
            this.save()
            this.resetTransform()
            this.copyWorld(canvas, fromWorld, BoundsHelper.tempToOuterOf(toInnerBounds, fromWorld), blendMode, ceilPixel)
            this.restore()
        } else {
            if (blendMode) this.blendMode = blendMode
            this.setTempPixelBounds(fromWorld, ceilPixel)
            this.drawImage(canvas.view as HTMLCanvasElement, tempPixelBounds.x, tempPixelBounds.y, tempPixelBounds.width, tempPixelBounds.height, toInnerBounds.x, toInnerBounds.y, toInnerBounds.width, toInnerBounds.height)
            if (blendMode) this.blendMode = 'source-over'
        }
    }

    public copyWorldByReset(canvas: ILeaferCanvas, from?: IBoundsData, to?: IBoundsData, blendMode?: IBlendMode, onlyResetTransform?: boolean, ceilPixel?: boolean): void {
        this.resetTransform()
        this.copyWorld(canvas, from, to, blendMode, ceilPixel)
        if (!onlyResetTransform) this.useWorldTransform() // restore world transform
    }

    public useGrayscaleAlpha(bounds: IBoundsData): void { // 先实现功能，后期需通过 shader 优化性能
        this.setTempPixelBounds(bounds, true, true)

        let alpha: number, pixel: number
        const { context } = this, imageData = context.getImageData(tempPixelBounds.x, tempPixelBounds.y, tempPixelBounds.width, tempPixelBounds.height), { data } = imageData

        for (let i = 0, len = data.length; i < len; i += 4) {
            pixel = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114
            if (alpha = data[i + 3]) data[i + 3] = alpha === 255 ? pixel : alpha * (pixel / 255)
        }

        context.putImageData(imageData, tempPixelBounds.x, tempPixelBounds.y)
    }

    public useMask(maskCanvas: ILeaferCanvas, fromBounds?: IBoundsData, toBounds?: IBoundsData): void {
        this.copyWorld(maskCanvas, fromBounds, toBounds, 'destination-in')
    }

    public useEraser(eraserCanvas: ILeaferCanvas, fromBounds?: IBoundsData, toBounds?: IBoundsData): void {
        this.copyWorld(eraserCanvas, fromBounds, toBounds, 'destination-out')
    }

    public fillWorld(bounds: IBoundsData, color: string | object, blendMode?: IBlendMode, ceilPixel?: boolean): void {
        if (blendMode) this.blendMode = blendMode
        this.fillStyle = color
        this.setTempPixelBounds(bounds, ceilPixel)
        this.fillRect(tempPixelBounds.x, tempPixelBounds.y, tempPixelBounds.width, tempPixelBounds.height)
        if (blendMode) this.blendMode = 'source-over'
    }

    public strokeWorld(bounds: IBoundsData, color: string | object, blendMode?: IBlendMode, ceilPixel?: boolean): void {
        if (blendMode) this.blendMode = blendMode
        this.strokeStyle = color
        this.setTempPixelBounds(bounds, ceilPixel)
        this.strokeRect(tempPixelBounds.x, tempPixelBounds.y, tempPixelBounds.width, tempPixelBounds.height)
        if (blendMode) this.blendMode = 'source-over'
    }

    public clipWorld(bounds: IBoundsData, ceilPixel: boolean = true): void {
        this.beginPath()
        this.setTempPixelBounds(bounds, ceilPixel)
        this.rect(tempPixelBounds.x, tempPixelBounds.y, tempPixelBounds.width, tempPixelBounds.height)
        this.clip()

    }

    public clipUI(ruleData: IWindingRuleData): void {
        ruleData.windingRule ? this.clip(ruleData.windingRule) : this.clip()
    }

    public clearWorld(bounds: IBoundsData, ceilPixel: boolean = true): void {
        this.setTempPixelBounds(bounds, ceilPixel)
        this.clearRect(tempPixelBounds.x, tempPixelBounds.y, tempPixelBounds.width, tempPixelBounds.height)
    }

    public clear(): void {
        const { pixelRatio } = this
        this.clearRect(0, 0, this.width * pixelRatio + 2, this.height * pixelRatio + 2)
    }


    // other

    protected setTempPixelBounds(bounds: IBoundsData, ceil?: boolean, intersect?: boolean): void {
        this.copyToPixelBounds(tempPixelBounds, bounds, ceil, intersect)
    }

    protected setTempPixelBounds2(bounds: IBoundsData, ceil?: boolean, intersect?: boolean): void {
        this.copyToPixelBounds(tempPixelBounds2, bounds, ceil, intersect)
    }

    protected copyToPixelBounds(pixelBounds: IBounds, bounds: IBoundsData, ceil?: boolean, intersect?: boolean): void {
        pixelBounds.set(bounds)
        if (intersect) pixelBounds.intersect(this.bounds)
        pixelBounds.scale(this.pixelRatio)
        if (ceil) pixelBounds.ceil()
    }

    public isSameSize(size: IScreenSizeData): boolean {
        return this.width === size.width && this.height === size.height && (!size.pixelRatio || this.pixelRatio === size.pixelRatio)
    }

    // 需要有 manager变量
    public getSameCanvas(useSameWorldTransform?: boolean, useSameSmooth?: boolean): ILeaferCanvas {
        const { size, pixelSnap } = this, canvas = this.manager ? this.manager.get(size) : Creator.canvas({ ...size })
        canvas.save()

        if (useSameWorldTransform) copy(canvas.worldTransform, this.worldTransform), canvas.useWorldTransform()
        if (useSameSmooth) canvas.smooth = this.smooth
        canvas.pixelSnap !== pixelSnap && (canvas.pixelSnap = pixelSnap)

        return canvas
    }

    public recycle(clearBounds?: IBoundsData): void {
        if (!this.recycled) {
            this.restore()
            clearBounds ? this.clearWorld(clearBounds) : this.clear()
            this.manager ? this.manager.recycle(this) : this.destroy()
        }
    }

    public updateRender(_bounds?: IBoundsData): void { }

    public unrealCanvas(): void { }

    public destroy(): void {
        this.manager = this.view = this.parentView = null
    }
}