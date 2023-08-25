import { ILeaf, ILeaferCanvas, IRenderer, IRendererConfig, IEventListenerId, IBounds, IFunction, IRenderOptions } from '@leafer/interface'
import { AnimateEvent, LayoutEvent, RenderEvent, ResizeEvent } from '@leafer/event'
import { ImageManager } from '@leafer/image'
import { Bounds } from '@leafer/math'
import { DataHelper } from '@leafer/data'
import { Platform } from '@leafer/platform'
import { Debug, Run } from '@leafer/debug'


const debug = Debug.get('Renderer')

export class Renderer implements IRenderer {

    public target: ILeaf
    public canvas: ILeaferCanvas
    public updateBlocks: IBounds[]

    public FPS = 60
    public totalTimes = 0
    public times: number = 0

    public running: boolean
    public rendering: boolean

    public waitAgain: boolean
    public changed: boolean

    public config: IRendererConfig = {
        usePartRender: true,
        maxFPS: 60
    }

    protected renderBounds: IBounds
    protected renderOptions: IRenderOptions
    protected totalBounds: IBounds

    protected __eventIds: IEventListenerId[]

    protected get needFill(): boolean { return !!(!this.canvas.allowBackgroundColor && this.config.fill) }

    constructor(target: ILeaf, canvas: ILeaferCanvas, userConfig?: IRendererConfig) {
        this.target = target
        this.canvas = canvas
        if (userConfig) this.config = DataHelper.default(userConfig, this.config)
        this.__listenEvents()
        this.__requestRender()
    }

    public start(): void {
        this.running = true
    }

    public stop(): void {
        this.running = false
    }

    public update(): void {
        this.changed = true
    }

    public requestLayout(): void {
        this.target.emit(LayoutEvent.REQUEST)
    }

    public render(callback?: IFunction): void {
        if (!(this.running && this.canvas.view)) {
            this.changed = true
            return
        }

        const { target } = this
        this.times = 0
        this.totalBounds = new Bounds()

        debug.log(target.innerName, '--->')

        try {
            this.emitRender(RenderEvent.START)
            this.renderOnce(callback)
            this.emitRender(RenderEvent.END, this.totalBounds)

            ImageManager.clearRecycled()
        } catch (e) {
            debug.error(e)
        }

        debug.log('-------------|')
    }

    public renderAgain(): void {
        if (this.rendering) {
            this.waitAgain = true
        } else {
            this.renderOnce()
        }
    }

    public renderOnce(callback?: IFunction): void {
        if (this.rendering) return debug.warn('rendering')
        if (this.times > 3) return debug.warn('render max times')

        this.times++
        this.totalTimes++

        this.rendering = true
        this.changed = false
        this.renderBounds = new Bounds()
        this.renderOptions = {}

        if (callback) {
            this.emitRender(RenderEvent.BEFORE)
            callback()
        } else {
            this.requestLayout()

            this.emitRender(RenderEvent.BEFORE)

            if (this.config.usePartRender && this.totalTimes > 1) {
                this.partRender()
            } else {
                this.fullRender()
            }
        }

        this.emitRender(RenderEvent.RENDER, this.renderBounds, this.renderOptions)
        this.emitRender(RenderEvent.AFTER, this.renderBounds, this.renderOptions)

        this.updateBlocks = null
        this.rendering = false

        if (this.waitAgain) {
            this.waitAgain = false
            this.renderOnce()
        }
    }

    public partRender(): void {
        const { canvas, updateBlocks: list } = this
        if (!list) return debug.warn('PartRender: need update attr')

        if (list.some(block => block.includes(this.target.__world))) this.mergeBlocks()
        list.forEach(block => { if (canvas.bounds.hit(block) && !block.isEmpty()) this.clipRender(block) })
    }

    public clipRender(block: IBounds): void {
        const t = Run.start('PartRender')
        const { canvas } = this

        const bounds = block.getIntersect(canvas.bounds)
        const includes = block.includes(this.target.__world)
        const realBounds = new Bounds().copy(bounds)

        canvas.save()

        if (includes && !Debug.showRepaint) {
            canvas.clear()
        } else {
            bounds.spread(1 + 1 / this.canvas.pixelRatio).ceil()
            canvas.clearWorld(bounds, true)
            canvas.clipWorld(bounds, true)
        }

        this.__render(bounds, realBounds)
        canvas.restore()

        Run.end(t)
    }

    public fullRender(): void {
        const t = Run.start('FullRender')
        const { canvas } = this

        canvas.save()
        canvas.clear()
        this.__render(canvas.bounds)
        canvas.restore()

        Run.end(t)
    }

    protected __render(bounds: IBounds, realBounds?: IBounds): void {
        const options: IRenderOptions = bounds?.includes(this.target.__world) ? {} : { bounds }

        if (this.needFill) this.canvas.fillWorld(bounds, this.config.fill)
        if (Debug.showRepaint) this.canvas.strokeWorld(bounds, 'red')

        this.target.__render(this.canvas, options)

        this.renderBounds = realBounds || bounds
        this.renderOptions = options
        this.totalBounds.isEmpty() ? this.totalBounds = this.renderBounds : this.totalBounds.add(this.renderBounds)

        if (Debug.showHitView) this.renderHitView(options)
        if (Debug.showBoundsView) this.renderBoundsView(options)
    }

    public renderHitView(_options: IRenderOptions): void { }

    public renderBoundsView(_options: IRenderOptions): void { }

    public addBlock(block: IBounds): void {
        if (!this.updateBlocks) this.updateBlocks = []
        this.updateBlocks.push(block)
    }

    public mergeBlocks(): void {
        const { updateBlocks: list } = this
        if (list) {
            const bounds = new Bounds()
            bounds.setByList(list)
            list.length = 0
            list.push(bounds)
        }
    }

    protected __requestRender(): void {
        const startTime = Date.now()
        Platform.requestRender(() => {
            this.FPS = Math.min(60, Math.ceil(1000 / (Date.now() - startTime)))
            if (this.changed) {
                if (this.running && this.canvas.view) this.render()
            }
            if (this.running) this.target.emit(AnimateEvent.FRAME)
            if (this.target) this.__requestRender()
        })
    }

    protected __onResize(e: ResizeEvent): void {
        if (this.canvas.unreal) return
        if (e.bigger || !e.samePixelRatio) {
            const { width, height } = e.old
            const bounds = new Bounds(0, 0, width, height)
            if (!bounds.includes(this.target.__world) || this.needFill || !e.samePixelRatio) {
                this.addBlock(this.canvas.bounds)
                this.target.forceUpdate('blendMode')
            }
        }
    }

    protected __onLayoutEnd(event: LayoutEvent): void {
        if (event.data) event.data.map(item => {
            let empty: boolean
            if (item.updatedList) item.updatedList.list.some(leaf => {
                empty = (!leaf.__world.width || !leaf.__world.height)
                if (empty) {
                    if (!leaf.isLeafer) debug.warn(leaf.innerName, ': empty')
                    empty = (!leaf.isBranch || leaf.isBranchLeaf) // render object
                }
                return empty
            })
            this.addBlock(empty ? this.canvas.bounds : item.updatedBounds)
        })
    }

    protected emitRender(type: string, bounds?: IBounds, options?: IRenderOptions): void {
        this.target.emitEvent(new RenderEvent(type, this.times, bounds, options))
    }

    protected __listenEvents(): void {
        const { target } = this
        this.__eventIds = [
            target.on_(RenderEvent.REQUEST, this.update, this),
            target.on_(LayoutEvent.END, this.__onLayoutEnd, this),
            target.on_(RenderEvent.AGAIN, this.renderAgain, this),
            target.on_(ResizeEvent.RESIZE, this.__onResize, this)
        ]
    }

    protected __removeListenEvents(): void {
        this.target.off_(this.__eventIds)
    }

    public destroy(): void {
        if (this.target) {
            this.stop()
            this.__removeListenEvents()
            this.target = null
            this.canvas = null
            this.config = null
        }
    }
}