import { IBounds, ILeaferCanvas, ICanvasStrokeOptions, ICanvasContext2D, ILeaferCanvasConfig, IMatrixData, IBoundsData, IAutoBounds, ISizeData, IScreenSizeData, IResizeEventListener, IMatrixWithBoundsData, IPointData, InnerId, ICanvasManager, IWindingRule } from '@leafer/interface'
import { Bounds, BoundsHelper, IncrementId } from '@leafer/math'
import { ResizeEvent } from '@leafer/event'
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

    public readonly innerId: InnerId

    public manager: ICanvasManager
    public view: HTMLCanvasElement

    public pixelRatio: number
    public get pixelWidth(): number { return this.width * this.pixelRatio }
    public get pixelHeight(): number { return this.height * this.pixelRatio }

    public bounds: IBounds

    public recycled?: boolean

    protected resizeObserver: ResizeObserver

    constructor(config?: ILeaferCanvasConfig, manager?: ICanvasManager) {
        super()

        if (!config) config = minSize

        this.manager = manager
        this.innerId = IncrementId.create(IncrementId.CNAVAS)

        if (config.view) {

            const { view } = config

            let realView: unknown = (typeof view === 'string') ? document.getElementById(view) : view as HTMLElement
            if (realView) {
                if (realView instanceof HTMLCanvasElement) {

                    this.view = realView

                } else {
                    if (realView === window || realView === document) {
                        const div = document.createElement('div')
                        const { style } = div
                        style.position = 'absolute'
                        style.top = style.bottom = style.left = style.right = '0px'
                        style.overflow = 'hidden'
                        document.body.appendChild(div)
                        realView = div
                    }

                    this.view = document.createElement('canvas');
                    (realView as HTMLElement).appendChild(this.view)
                }
            } else {
                debug.error(`can't find view by id: ${view}`)
            }

        }

        if (!this.view) this.view = document.createElement('canvas')
        this.pixelRatio = config.pixelRatio

        if (!config.webgl) {
            this.context = this.view.getContext('2d') as ICanvasContext2D
            this.smooth = true
            if (config.fill) this.view.style.backgroundColor = config.fill
            if (config.width && config.height) this.resize(config as IScreenSizeData)

            this.bindContextMethod()
        }
    }

    public debug(): void { }

    public pixel(num: number): number { return num * this.pixelRatio }

    public autoLayout(autoBounds: IAutoBounds, listener: IResizeEventListener): void {
        const check = (parentSize: ISizeData) => {
            const { x, y, width, height } = autoBounds.getBoundsFrom(parentSize)
            const { style } = this.view
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

        const parent = this.view.parentElement
        if (parent) {
            this.resizeObserver.observe(parent)
            check(parent.getBoundingClientRect())
        }
    }

    public stopAutoLayout(): void {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect()
            this.resizeObserver = null
        }
    }

    public resize(size: IScreenSizeData): void {
        const { style } = this.view
        const { width, height, pixelRatio } = size
        if (this.isSameSize(size)) return

        let takeCanvas: ILeaferCanvas
        if (this.context && this.width) {
            takeCanvas = this.getSameCanvas()
            takeCanvas.copy(this)
        }

        Object.assign(this, { width, height, pixelRatio })
        this.bounds = new Bounds(0, 0, width, height)

        style.width = width + 'px'
        style.height = height + 'px'
        this.view.width = width * pixelRatio
        this.view.height = height * pixelRatio

        if (this.context && takeCanvas) {
            this.copy(takeCanvas)
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

    public setShadow(x: number, y: number, blur: number, color?: string): void {
        const { pixelRatio } = this
        this.shadowOffsetX = x * pixelRatio
        this.shadowOffsetY = y * pixelRatio
        this.shadowBlur = blur * pixelRatio
        this.shadowColor = color || 'black'
    }

    public setBlur(blur: number): void {
        const { pixelRatio } = this
        this.filter = `blur(${blur * pixelRatio}px)`
    }


    public hitPath(point: IPointData, fillRule?: IWindingRule): boolean {
        return this.context.isPointInPath(point.x, point.y, fillRule)
    }

    public hitStroke(point: IPointData): boolean {
        return this.context.isPointInStroke(point.x, point.y)
    }

    public replaceBy(canvas: ILeaferCanvas, from?: IBoundsData, to?: IBoundsData): void {
        canvas.save()
        this.blendMode = 'copy'
        this.copy(canvas, from, to)
        canvas.restore()
    }

    public copy(canvas: ILeaferCanvas, from?: IBoundsData, to?: IBoundsData, blendMode?: string): void {
        if (from) {
            if (!to) to = from
            const { pixelRatio } = this
            if (blendMode) this.blendMode = blendMode
            this.drawImage(canvas.view as HTMLCanvasElement, from.x * pixelRatio, from.y * pixelRatio, from.width * pixelRatio, from.height * pixelRatio, to.x * pixelRatio, to.y * pixelRatio, to.width * pixelRatio, to.height * pixelRatio)
            if (blendMode) this.blendMode = 'normal'
        } else {
            this.drawImage(canvas.view as HTMLCanvasElement, 0, 0)
        }

    }

    public copyWorldToLocal(canvas: ILeaferCanvas, fromWorld: IMatrixWithBoundsData, toLocalBounds: IBoundsData, blendMode?: string): void {
        const { pixelRatio } = this
        if (blendMode) this.blendMode = blendMode
        if (fromWorld.b || fromWorld.c) {
            this.save()
            this.resetTransform()
            this.copy(canvas, fromWorld, BoundsHelper.tempTimesMatrix(toLocalBounds, fromWorld))
            this.restore()
        } else {
            this.drawImage(canvas.view as HTMLCanvasElement, fromWorld.x * pixelRatio, fromWorld.y * pixelRatio, fromWorld.width * pixelRatio, fromWorld.height * pixelRatio, toLocalBounds.x, toLocalBounds.y, toLocalBounds.width, toLocalBounds.height)
        }
        if (blendMode) this.blendMode = 'normal'
    }

    public fillBounds(bounds: IBoundsData, color: string | object, blendMode?: string): void {
        const { pixelRatio } = this
        if (blendMode) this.blendMode = blendMode
        this.fillStyle = color
        this.fillRect(bounds.x * pixelRatio, bounds.y * pixelRatio, bounds.width * pixelRatio, bounds.height * pixelRatio)
        if (blendMode) this.blendMode = 'normal'
    }

    public strokeBounds(bounds: IBoundsData, color: string | object, blendMode?: string): void {
        const { pixelRatio } = this
        if (blendMode) this.blendMode = blendMode
        this.strokeStyle = color
        this.strokeRect(bounds.x * pixelRatio, bounds.y * pixelRatio, bounds.width * pixelRatio, bounds.height * pixelRatio)
        if (blendMode) this.blendMode = 'normal'
    }

    public clearBounds(bounds: IBoundsData, ceil?: boolean): void {
        const { pixelRatio } = this
        temp.copy(bounds).scale(pixelRatio)
        if (ceil) temp.ceil()
        this.clearRect(temp.x, temp.y, temp.width, temp.height)
    }

    public clipBounds(bounds: IBoundsData, ceil?: boolean): void {
        const { pixelRatio } = this
        this.beginPath()
        temp.copy(bounds).scale(pixelRatio)
        if (ceil) temp.ceil()
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
            this.manager = null
            if (this.view && this.view.parentElement) this.view.remove()
            this.view = null
            this.bounds = null
        }
    }

}