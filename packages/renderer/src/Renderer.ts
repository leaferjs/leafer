import { ILeaf, ILeaferCanvas, IRenderer, IRendererConfig, IEventListenerId, IBounds, IFunction } from '@leafer/interface'
import { LayoutEvent, RenderEvent, ResizeEvent } from '@leafer/event'
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
    public changed: boolean

    public config: IRendererConfig = {
        usePartRender: true,
        maxFPS: 60
    }

    protected __eventIds: IEventListenerId[]

    constructor(target: ILeaf, canvas: ILeaferCanvas, userConfig: IRendererConfig) {
        this.target = target
        this.canvas = canvas
        if (userConfig) this.config = DataHelper.default(userConfig, this.config)
        this.__listenEvents()
    }

    public start(): void {
        this.running = true
    }

    public stop(): void {
        this.running = false
    }

    public update(): void {
        if (!this.changed) this.__requestRender()
        this.changed = true
    }

    public requestLayout(): void {
        this.target.emit(LayoutEvent.REQUEST)
    }

    public render(callback?: IFunction): void {
        const { target } = this
        this.times = 0

        debug.log(target.innerId, '--->')

        target.emit(RenderEvent.START)
        this.renderOnce(callback)
        target.emit(RenderEvent.RENDER)
        target.emit(RenderEvent.END)

        debug.log(target.innerId, '---|')
    }

    public renderOnce(callback?: IFunction): void {
        const { target } = this

        this.times++
        this.totalTimes++
        this.changed = false

        if (callback) {

            target.emit(RenderEvent.BEFORE_ONCE)

            callback()

        } else {

            this.requestLayout()

            target.emit(RenderEvent.BEFORE_ONCE)

            if (this.config.usePartRender && this.totalTimes > 1) {
                this.partRender()
            } else {
                this.fullRender()
            }

        }

        target.emit(RenderEvent.ONCE)
        target.emit(RenderEvent.AFTER_ONCE)


        this.updateBlocks = null

        this.__checkAgain()
    }

    public partRender(): void {
        const { canvas, updateBlocks: list } = this

        if (!list) {
            debug.warn('PartRender: layoutedBlocks is empty')
            this.fullRender(canvas.bounds)
            return
        }

        if (list.some(block => block.includes(this.target.__world))) {
            this.mergeBlocks()
            this.clipRender(this.updateBlocks[0], true)
        } else {
            list.forEach(block => {
                if (canvas.bounds.hit(block) && !block.isEmpty()) this.clipRender(block.getIntersect(canvas.bounds))
            })
        }
    }

    public clipRender(bounds: IBounds, fullMode?: boolean): void {
        const t = Run.start('PartRender')
        const { canvas, target } = this

        canvas.save()
        canvas.clearBounds(bounds)
        if (Debug.showRepaint) canvas.strokeBounds(bounds, 'red')
        canvas.clipBounds(bounds)
        target.__render(canvas, fullMode ? {} : { bounds })
        canvas.restore()

        Run.end(t)
    }

    public fullRender(bounds?: IBounds): void {
        const { canvas, target } = this
        Renderer.fullRender(target, canvas, bounds)
    }

    static fullRender(target: ILeaf, canvas: ILeaferCanvas, bounds?: IBounds): void {
        const t = Run.start('FullRender')
        if (!bounds) bounds = canvas.bounds

        canvas.save()
        canvas.clear()
        target.__render(canvas, canvas.bounds.includes(target.__world) ? {} : { bounds })
        canvas.restore()

        Run.end(t)
    }

    public addBlock(block: IBounds): void {
        if (!this.updateBlocks) this.updateBlocks = []
        this.updateBlocks.push(block)
    }

    public mergeBlocks(): void {
        const { updateBlocks } = this
        if (updateBlocks) {
            const bounds = new Bounds()
            bounds.setByList(updateBlocks)
            this.updateBlocks = [bounds]
        }
    }

    protected __checkAgain(): void {
        if (this.changed && this.times < 3) this.target.emit(RenderEvent.AGAIN)
    }

    protected __requestRender(): void {
        const startTime = Date.now()
        Platform.requestRender(() => {
            if (this.changed) {
                this.FPS = Math.min(60, Math.ceil(1000 / (Date.now() - startTime)))
                if (this.running) this.render()
            }
        })
    }

    protected __onResize(e: ResizeEvent): void {
        if (e.bigger || !e.samePixelRatio) {
            const { width, height } = e.old
            const bounds = new Bounds(0, 0, width, height)
            if (!bounds.includes(this.target.__world)) {
                this.target.__updateAttr('fill')
                this.update()
            }
        }
    }

    protected __onLayoutEnd(event: LayoutEvent): void {
        event.data.map(item => this.addBlock(item.updatedBounds))
    }

    protected __listenEvents(): void {
        const { target } = this
        this.__eventIds = [
            target.on__(RenderEvent.REQUEST, this.update, this),
            target.on__(LayoutEvent.END, this.__onLayoutEnd, this),
            target.on__(RenderEvent.AGAIN, this.renderOnce, this),
            target.on__(ResizeEvent.RESIZE, this.__onResize, this)
        ]
    }

    protected __removeListenEvents(): void {
        this.target.off__(this.__eventIds)
    }

    public destroy(): void {
        if (this.target) {
            this.__removeListenEvents()
            this.target = null
            this.canvas = null
            this.config = null
        }
    }
}