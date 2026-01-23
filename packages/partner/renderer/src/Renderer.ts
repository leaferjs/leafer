import { ILeaf, ILeaferBase, ILeaferCanvas, IRenderer, IRendererConfig, IEventListenerId, IBounds, IFunction, IRenderOptions, ILeafList } from '@leafer/interface'
import { LayoutEvent, RenderEvent, ResizeEvent, ImageManager, Bounds, DataHelper, Platform, Debug, Run } from '@leafer/core'


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
    public ignore: boolean

    public config: IRendererConfig = {
        usePartRender: true,
        ceilPartPixel: true,
        maxFPS: 120
    }

    static clipSpread = 10

    protected renderBounds: IBounds
    protected renderOptions: IRenderOptions
    protected totalBounds: IBounds

    protected requestTime: number
    protected frameTime: number
    protected frames: number[] = []
    protected __eventIds: IEventListenerId[]

    protected get needFill(): boolean { return !!(!this.canvas.allowBackgroundColor && this.config.fill) }

    constructor(target: ILeaf, canvas: ILeaferCanvas, userConfig?: IRendererConfig) {
        this.target = target
        this.canvas = canvas
        if (userConfig) this.config = DataHelper.default(userConfig, this.config)
        this.__listenEvents()
    }

    public start(): void {
        this.running = true
        this.update(false)
    }

    public stop(): void {
        this.running = false
    }

    public update(change = true): void {
        if (!this.changed) this.changed = change
        if (!this.requestTime) this.__requestRender()
    }

    public requestLayout(): void {
        this.target.emit(LayoutEvent.REQUEST)
    }

    public checkRender(): void {
        if (this.running) {
            const { target } = this
            if (target.isApp) {
                target.emit(RenderEvent.CHILD_START, target);
                (target.children as ILeaferBase[]).forEach(leafer => {
                    leafer.renderer.FPS = this.FPS
                    leafer.renderer.checkRender()
                })
                target.emit(RenderEvent.CHILD_END, target)
            }

            if (this.changed && this.canvas.view) this.render()
            this.target.emit(RenderEvent.NEXT)
        }
    }

    public render(callback?: IFunction): void {
        if (!(this.running && this.canvas.view)) return this.update()

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
            this.rendering = false
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

            if (this.ignore) {
                this.ignore = this.rendering = false // 仍保留 updateBlocks 用于下次渲染
                return
            }

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
        if (!list) return // debug.warn('PartRender: need update attr')

        this.mergeBlocks()
        list.forEach(block => { if (canvas.bounds.hit(block) && !block.isEmpty()) this.clipRender(block) })
    }

    public clipRender(block: IBounds): void {
        const t = Run.start('PartRender')
        const { canvas } = this, bounds = block.getIntersect(canvas.bounds), realBounds = new Bounds(bounds)

        canvas.save()

        bounds.spread(Renderer.clipSpread).ceil() // 局部渲染区域需扩大一些，避免出现残影

        const { ceilPartPixel } = this.config
        canvas.clipWorld(bounds, ceilPartPixel)
        canvas.clearWorld(bounds, ceilPartPixel)

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
        const { canvas, target } = this, includes = bounds.includes(target.__world), options: IRenderOptions = includes ? { includes } : { bounds, includes }

        if (this.needFill) canvas.fillWorld(bounds, this.config.fill)
        if (Debug.showRepaint) Debug.drawRepaint(canvas, bounds)

        if (this.config.useCellRender) options.cellList = this.getCellList()

        Platform.render(target, canvas, options)

        this.renderBounds = realBounds = realBounds || bounds
        this.renderOptions = options
        this.totalBounds.isEmpty() ? this.totalBounds = realBounds : this.totalBounds.add(realBounds)

        canvas.updateRender(realBounds)
    }

    // need rewrite
    getCellList(): ILeafList {
        return undefined
    }

    public addBlock(block: IBounds): void {
        if (!this.updateBlocks) this.updateBlocks = []
        this.updateBlocks.push(block)
    }

    public mergeBlocks(): void {
        const { updateBlocks: list } = this
        if (list) {
            const bounds = new Bounds()
            bounds.setList(list)
            list.length = 0
            list.push(bounds)
        }
    }

    protected __requestRender(): void {
        const target = this.target as ILeaferBase
        if (this.requestTime || !target) return
        if (target.parentApp) return target.parentApp.requestRender(false) // App 模式下统一走 app 控制渲染帧

        this.requestTime = this.frameTime || Date.now()

        const render = () => {

            const nowFPS = 1000 / ((this.frameTime = Date.now()) - this.requestTime)

            const { maxFPS } = this.config
            if (maxFPS && nowFPS > maxFPS) return Platform.requestRender(render)

            const { frames } = this
            if (frames.length > 30) frames.shift()
            frames.push(nowFPS)
            this.FPS = Math.round(frames.reduce((a, b) => a + b, 0) / frames.length) // 帧率采样
            this.requestTime = 0

            this.checkRender()

        }

        Platform.requestRender(render)
    }

    protected __onResize(e: ResizeEvent): void {
        if (this.canvas.unreal) return
        if (e.bigger || !e.samePixelRatio) {
            const { width, height } = e.old
            const bounds = new Bounds(0, 0, width, height)
            if (!bounds.includes(this.target.__world) || this.needFill || !e.samePixelRatio) {
                this.addBlock(this.canvas.bounds)
                this.target.forceUpdate('surface')
                return
            }
        }

        // 需要象征性派发一下渲染事件
        this.addBlock(new Bounds(0, 0, 1, 1))
        this.update()
    }

    protected __onLayoutEnd(event: LayoutEvent): void {
        if (event.data) event.data.map(item => {
            let empty: boolean
            if (item.updatedList) item.updatedList.list.some(leaf => {
                empty = (!leaf.__world.width || !leaf.__world.height)
                if (empty) {
                    if (!leaf.isLeafer) debug.tip(leaf.innerName, ': empty')
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
        this.__eventIds = [
            this.target.on_([
                [RenderEvent.REQUEST, this.update, this],
                [LayoutEvent.END, this.__onLayoutEnd, this],
                [RenderEvent.AGAIN, this.renderAgain, this],
                [ResizeEvent.RESIZE, this.__onResize, this]
            ])
        ]
    }

    protected __removeListenEvents(): void {
        this.target.off_(this.__eventIds)
    }

    public destroy(): void {
        if (this.target) {
            this.stop()
            this.__removeListenEvents()
            this.config = {}
            this.target = this.canvas = null
        }
    }
}