import { IBounds, ILeaferCanvas, ICanvasStrokeOptions, ICanvasContext2D, ILeaferCanvasConfig, IMatrixData, IBoundsData, IAutoBounds, ISizeData, IScreenSizeData, IResizeEventListener, IMatrixWithBoundsData, IPointData, InnerId, ICanvasManager, IWindingRule } from '@leafer/interface'
import { Bounds, BoundsHelper, IncrementId } from '@leafer/math'
import { ResizeEvent } from '@leafer/event'
import { Platform } from '@leafer/platform'
import { Debug } from '@leafer/debug'

import { CanvasBase } from './CanvasBase'


const debug = Debug.get('LeaferCanvas')

const temp = new Bounds()
const minSize: IScreenSizeData = {
    width: 1,
    height: 1,
    pixelRatio: 1
}

export class LeaferCanvas extends CanvasBase implements ILeaferCanvas {

    public manager: ICanvasManager

    public readonly innerId: InnerId

    public pixelRatio: number
    public get pixelWidth(): number { return this.width * this.pixelRatio }
    public get pixelHeight(): number { return this.height * this.pixelRatio }

    public bounds: IBounds

    public view: HTMLCanvasElement | OffscreenCanvas
    public offscreen: boolean

    public recycled?: boolean

    protected resizeObserver: ResizeObserver

    constructor(config?: ILeaferCanvasConfig, manager?: ICanvasManager) {
        super()

        if (!config) config = minSize

        this.manager = manager
        this.innerId = IncrementId.create(IncrementId.CNAVAS)

        const { view, width, height, pixelRatio, fill, hittable: hitable } = config
        const autoLayout = !width || !height

        this.pixelRatio = pixelRatio
        this.offscreen = Platform.isWorker || config.offscreen

        if (this.offscreen) {
            view ? this.view = view as OffscreenCanvas : this.__createView()
        } else {
            view ? this.__createViewFrom(view) : this.__createView()
            const { style } = this.view as HTMLCanvasElement
            if (fill) style.backgroundColor = fill
            if (!hitable) style.pointerEvents = 'none'
            if (autoLayout) style.display || (style.display = 'block')
        }

        this.__init()
        if (!autoLayout) this.resize(config as IScreenSizeData)
    }

    protected __init(): void {
        this.context = this.view.getContext('2d') as ICanvasContext2D
        this.smooth = true
        this.__bindContext()
    }

    protected __createView(): void {
        this.view = this.offscreen ? new OffscreenCanvas(1, 1) : document.createElement('canvas')
    }

    protected __createViewFrom(inputView: string | object): void {
        let find: unknown = (typeof inputView === 'string') ? document.getElementById(inputView) : inputView as HTMLElement
        if (find) {
            if (find instanceof HTMLCanvasElement) {

                this.view = find

            } else {

                let parent = find as HTMLDivElement
                if (find === window || find === document) {
                    const div = document.createElement('div')
                    const { style } = div
                    style.position = 'absolute'
                    style.top = style.bottom = style.left = style.right = '0px'
                    style.overflow = 'hidden'
                    document.body.appendChild(div)
                    parent = div
                }

                this.__createView()
                const view = this.view as HTMLCanvasElement

                if (parent.hasChildNodes()) {
                    const { style } = view
                    style.position = 'absolute'
                    style.top = style.left = '0px'
                    parent.style.position || (parent.style.position = 'relative')
                }

                parent.appendChild(view)
            }
        } else {
            debug.error(`can't find view by id: ${inputView}`)
            this.__createView()
        }
    }

    public pixel(num: number): number { return num * this.pixelRatio }

    public startAutoLayout(autoBounds: IAutoBounds, listener: IResizeEventListener): void {
        if (!this.offscreen) {
            const view = this.view as HTMLCanvasElement
            const check = (parentSize: ISizeData) => {
                const { x, y, width, height } = autoBounds.getBoundsFrom(parentSize)
                const { style } = view
                style.marginLeft = x + 'px'
                style.marginTop = y + 'px'

                if (width !== this.width || height !== this.height) {
                    const { pixelRatio } = this
                    const size = { width, height, pixelRatio }
                    const oldSize = { width: this.width, height: this.height, pixelRatio: this.pixelRatio }
                    this.resize(size)
                    if (this.width !== undefined) listener(new ResizeEvent(size, oldSize))
                }
            }

            this.resizeObserver = new ResizeObserver((entries) => {
                for (const entry of entries) {
                    check(entry.contentRect)
                }
            })

            const parent = view.parentElement
            if (parent) {
                this.resizeObserver.observe(parent)
                check(parent.getBoundingClientRect())
            }
        }
    }

    public stopAutoLayout(): void {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect()
            this.resizeObserver = null
        }
    }

    public resize(size: IScreenSizeData): void {
        const { width, height, pixelRatio } = size
        if (this.isSameSize(size)) return

        let takeCanvas: ILeaferCanvas
        if (this.context && this.width) {
            takeCanvas = this.getSameCanvas()
            takeCanvas.copyWorld(this)
        }

        Object.assign(this, { width, height, pixelRatio })
        this.bounds = new Bounds(0, 0, width, height)

        if (!this.offscreen) {
            const { style } = this.view as HTMLCanvasElement
            style.width = width + 'px'
            style.height = height + 'px'
        }

        this.view.width = width * pixelRatio
        this.view.height = height * pixelRatio

        if (this.context && takeCanvas) {
            this.copyWorld(takeCanvas)
            takeCanvas.recycle()
        }
    }

    public setWorld(matrix: IMatrixData, parentMatrix?: IMatrixData, onlyTranslate?: boolean): void {
        const { pixelRatio } = this
        if (parentMatrix) {

            if (onlyTranslate) {
                this.setTransform(
                    matrix.a * pixelRatio,
                    matrix.b * pixelRatio,
                    matrix.c * pixelRatio,
                    matrix.d * pixelRatio,
                    (matrix.e + parentMatrix.e) * pixelRatio,
                    (matrix.f + parentMatrix.f) * pixelRatio
                )
            } else {
                const { a, b, c, d, e, f } = parentMatrix
                this.setTransform(
                    ((matrix.a * a) + (matrix.b * c)) * pixelRatio,
                    ((matrix.a * b) + (matrix.b * d)) * pixelRatio,
                    ((matrix.c * a) + (matrix.d * c)) * pixelRatio,
                    ((matrix.c * b) + (matrix.d * d)) * pixelRatio,
                    (((matrix.e * a) + (matrix.f * c) + e)) * pixelRatio,
                    (((matrix.e * b) + (matrix.f * d) + f)) * pixelRatio
                )
            }

        } else {

            this.setTransform(
                matrix.a * pixelRatio,
                matrix.b * pixelRatio,
                matrix.c * pixelRatio,
                matrix.d * pixelRatio,
                matrix.e * pixelRatio,
                matrix.f * pixelRatio
            )
        }
    }

    public useSameTransform(canvas: ILeaferCanvas): void {
        this.setTransform(canvas.getTransform())
    }


    public setStroke(strokeStyle: string | object, strokeWidth: number, options?: ICanvasStrokeOptions): void {

        if (strokeWidth) this.strokeWidth = strokeWidth
        if (strokeStyle) this.strokeStyle = strokeStyle
        if (options) {
            this.strokeCap = options.strokeCap
            this.strokeJoin = options.strokeJoin
            this.dashPattern = options.dashPattern
            this.miterLimit = options.miterLimit
        }
    }

    public hitPath(point: IPointData, fillRule?: IWindingRule): boolean {
        return this.context.isPointInPath(point.x, point.y, fillRule)
    }

    public hitStroke(point: IPointData): boolean {
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


    public copyWorld(canvas: ILeaferCanvas, from?: IBoundsData, to?: IBoundsData, blendMode?: string): void {
        if (blendMode) this.blendMode = blendMode
        if (from) {
            const { pixelRatio } = this
            if (!to) to = from
            this.drawImage(canvas.view as HTMLCanvasElement, from.x * pixelRatio, from.y * pixelRatio, from.width * pixelRatio, from.height * pixelRatio, to.x * pixelRatio, to.y * pixelRatio, to.width * pixelRatio, to.height * pixelRatio)
        } else {
            this.drawImage(canvas.view as HTMLCanvasElement, 0, 0)
        }
        if (blendMode) this.blendMode = 'normal'
    }

    public copyWorldToLocal(canvas: ILeaferCanvas, fromWorld: IMatrixWithBoundsData, toLocalBounds: IBoundsData, blendMode?: string): void {
        if (blendMode) this.blendMode = blendMode
        if (fromWorld.b || fromWorld.c) {
            this.save()
            this.resetTransform()
            this.copyWorld(canvas, fromWorld, BoundsHelper.tempToWorld(toLocalBounds, fromWorld))
            this.restore()
        } else {
            const { pixelRatio } = this
            this.drawImage(canvas.view as HTMLCanvasElement, fromWorld.x * pixelRatio, fromWorld.y * pixelRatio, fromWorld.width * pixelRatio, fromWorld.height * pixelRatio, toLocalBounds.x, toLocalBounds.y, toLocalBounds.width, toLocalBounds.height)
        }
        if (blendMode) this.blendMode = 'normal'
    }

    public fillWorld(bounds: IBoundsData, color: string | object, blendMode?: string): void {
        if (blendMode) this.blendMode = blendMode
        this.fillStyle = color
        temp.copy(bounds).scale(this.pixelRatio)
        this.fillRect(temp.x, temp.y, temp.width, temp.height)
        if (blendMode) this.blendMode = 'normal'
    }

    public strokeWorld(bounds: IBoundsData, color: string | object, blendMode?: string): void {
        if (blendMode) this.blendMode = blendMode
        this.strokeStyle = color
        temp.copy(bounds).scale(this.pixelRatio)
        this.strokeRect(temp.x, temp.y, temp.width, temp.height)
        if (blendMode) this.blendMode = 'normal'
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
    public getSameCanvas(useSameTransform?: boolean): ILeaferCanvas {
        const { width, height, pixelRatio } = this
        const canvas = this.manager.get({ width, height, pixelRatio })
        canvas.manager || (canvas.manager = this.manager)
        canvas.save()
        if (useSameTransform) canvas.useSameTransform(this)
        return canvas
    }

    public getBiggerCanvas(addWidth: number, addHeight: number): ILeaferCanvas {
        let { width, height, pixelRatio } = this
        if (addWidth) width += addWidth
        if (addHeight) height += addHeight
        const canvas = this.manager.get({ width, height, pixelRatio })
        canvas.manager || (canvas.manager = this.manager)
        canvas.save()
        return canvas
    }

    public recycle(): void {
        this.restore()
        this.manager.recycle(this)
    }


    public destroy(): void {
        if (this.view) {
            super.destroy()
            this.stopAutoLayout()
            if (!this.offscreen) {
                const view = this.view as HTMLCanvasElement
                if (view.parentElement) view.remove()
            }
            this.manager = null
            this.view = null
            this.context = null
        }
    }

}