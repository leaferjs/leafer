import { ILeaf, ILeaferCanvas, IRenderer, IRendererConfig, IEventListenerId, IBounds, IFunction, ILayoutBlockData } from '@leafer/interface'
import { LayoutEvent, RenderEvent, ResizeEvent } from '@leafer/event'
import { Bounds } from '@leafer/math'
import { DataHelper } from '@leafer/data'
import { Platform } from '@leafer/platform'
import { Debug, Run } from '@leafer/debug'


export class Renderer implements IRenderer {

    public target: ILeaf
    public canvas: ILeaferCanvas
    public layoutedBlocks: ILayoutBlockData[]

    public totalTimes = 0
    public times: number = 0

    public FPS = 60

    public config: IRendererConfig = {
        maxFPS: 60
    }

    public running: boolean

    private _changed = false
    set changed(value: boolean) {
        if (value) {
            if (!this._changed) {
                this._changed = true
                this.requestRender()
            }
        } else {
            this._changed = false
        }
    }
    get changed(): boolean { return this._changed }

    protected eventIds: IEventListenerId[]

    constructor(target: ILeaf, canvas: ILeaferCanvas, userConfig: IRendererConfig) {
        this.target = target
        this.canvas = canvas
        if (userConfig) this.config = DataHelper.default(userConfig, this.config)
        this.listenEvents()
    }

    public start(): void {
        this.running = true
        this.changed = true
    }

    public stop(): void {
        this.running = false
    }

    private listenEvents(): void {
        const { target } = this
        this.eventIds = [
            target.on__(RenderEvent.REQUEST, this.onRequest, this),
            target.on__(LayoutEvent.END, this.onLayoutEnd, this),
            target.on__(RenderEvent.AGAIN, this.renderOnce, this),
            target.on__(ResizeEvent.RESIZE, this.onResize, this)
        ]
    }

    private removeListenEvents(): void {
        this.target.off__(this.eventIds)
    }

    protected onResize(e: ResizeEvent): void {
        if (e.bigger || !e.samePixelRatio) {
            const { width, height } = e.old
            const bounds = new Bounds(0, 0, width, height)
            if (!bounds.includes(this.target.__world)) {
                this.target.__updateAttr('fill')
                this.changed = true
            }
        }
    }

    protected onRequest(): void {
        this.changed = true
    }

    public requestLayout(): void {
        this.target.emit(LayoutEvent.REQUEST)
    }

    public onLayoutEnd(event: LayoutEvent): void {
        this.layoutedBlocks = event.data
    }

    public render(callback?: IFunction): void {
        const { target } = this
        const { START, RENDER, END } = RenderEvent
        this.times = 0
        target.emit(START)
        this.renderOnce(callback)
        target.emit(RENDER)
        target.emit(END)
    }

    public renderOnce(callback?: IFunction): void {
        const { target } = this
        const { BEFORE_ONCE, ONCE, AFTER_ONCE } = RenderEvent

        this.times++
        this.totalTimes++
        this.changed = false

        if (callback) {

            target.emit(BEFORE_ONCE)

            callback()

        } else {

            this.requestLayout()

            target.emit(BEFORE_ONCE)

            if (this.totalTimes > 1) {
                if (this.layoutedBlocks) this.partRender()
            } else {
                this.fullRender()
            }

        }

        target.emit(ONCE)
        target.emit(AFTER_ONCE)


        if (this.layoutedBlocks) {
            this.layoutedBlocks.forEach(item => { item.destroy() })
            this.layoutedBlocks = undefined
        }

        this.__checkAgain()
    }

    protected __checkAgain(): void {
        if (this.changed && this.times < 3) this.target.emit(RenderEvent.AGAIN)
    }


    protected partRender(): void {
        const { canvas, layoutedBlocks } = this

        if (layoutedBlocks.some(block => block.updatedBounds.includes(this.target.__world))) {
            this.fullRender(canvas.bounds)
        } else {
            let bounds: IBounds
            layoutedBlocks.forEach(block => {
                bounds = block.updatedBounds
                if (canvas.bounds.hit(bounds) && !bounds.isEmpty()) this.clipRender(bounds.getIntersect(canvas.bounds))
            })
        }
    }

    public clipRender(bounds: IBounds): void {
        const t = Run.start('part render')
        const { canvas, target } = this

        canvas.save()
        canvas.clearBounds(bounds)
        if (Debug.showRepaint) canvas.strokeBounds(bounds, 'red')
        canvas.clipBounds(bounds)
        target.__render(canvas, { bounds })
        canvas.restore()

        Run.end(t)
    }

    public fullRender(bounds?: IBounds): void {
        const { canvas, target } = this
        Renderer.fullRender(target, canvas, bounds)
        if (Debug.showRepaint) canvas.strokeBounds(bounds || canvas.bounds, 'red')
    }

    static fullRender(target: ILeaf, canvas: ILeaferCanvas, bounds?: IBounds): void {
        const t = Run.start('full render')
        if (!bounds) bounds = canvas.bounds

        canvas.save()
        canvas.clear()
        target.__render(canvas, canvas.bounds.includes(target.__world) ? {} : { bounds })
        canvas.restore()

        Run.end(t)
    }

    private requestRender(): void {
        const startTime = Date.now()
        Platform.requestRender(() => {
            if (this.changed) {
                this.FPS = Math.min(60, Math.ceil(1000 / (Date.now() - startTime)))
                if (this.running) this.render()
            }
        })
    }

    public destroy(): void {
        if (this.target) {
            this.removeListenEvents()
            this.target = undefined
            this.canvas = undefined
            this.config = undefined
        }
    }
}