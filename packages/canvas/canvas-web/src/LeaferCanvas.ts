import { ICanvasContext2D, IAutoBounds, ISizeData, IScreenSizeData, IResizeEventListener } from '@leafer/interface'
import { LeaferCanvasBase, canvasSizeAttrs } from '@leafer/canvas'
import { ResizeEvent } from '@leafer/event'
import { DataHelper } from '@leafer/data'
import { Debug } from '@leafer/debug'


const debug = Debug.get('LeaferCanvas')

export class LeaferCanvas extends LeaferCanvasBase {

    public view: HTMLCanvasElement | OffscreenCanvas
    public parentView: HTMLElement

    protected resizeObserver: ResizeObserver
    protected autoBounds: IAutoBounds
    protected resizeListener: IResizeEventListener

    public init(): void {
        const { view } = this.config

        if (this.offscreen) {
            view ? this.view = view as OffscreenCanvas : this.__createView()
        } else {
            view ? this.__createViewFrom(view) : this.__createView()
            const { style } = this.view as HTMLCanvasElement
            if (this.autoLayout) style.display || (style.display = 'block')
            this.parentView = (this.view as HTMLCanvasElement).parentElement
        }

        this.__createContext()

        if (!this.autoLayout) this.resize(this.config as IScreenSizeData)
    }

    public set backgroundColor(color: string) { (this.view as HTMLElement).style.backgroundColor = color }
    public get backgroundColor(): string { return (this.view as HTMLElement).style.backgroundColor }

    public set hittable(hittable: boolean) { (this.view as HTMLElement).style.pointerEvents = hittable ? 'auto' : 'none' }
    public get hittable() { return (this.view as HTMLElement).style.pointerEvents !== 'none' }

    protected __createContext(): void {
        this.context = this.view.getContext('2d') as ICanvasContext2D
        this.__bindContext()
    }

    protected __createView(): void {
        if (this.offscreen) {
            try {
                this.view = new OffscreenCanvas(1, 1)
                return
            } catch (e) {
                debug.error(e)
            }
        }
        this.view = document.createElement('canvas')
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
            debug.error(`no id: ${inputView}`)
            this.__createView()
        }
    }

    public setViewSize(size: IScreenSizeData): void {
        const { width, height, pixelRatio } = size

        if (!this.offscreen) {
            const { style } = this.view as HTMLCanvasElement
            style.width = width + 'px'
            style.height = height + 'px'
        }

        this.view.width = width * pixelRatio
        this.view.height = height * pixelRatio
    }

    public startAutoLayout(autoBounds: IAutoBounds, listener: IResizeEventListener): void {
        if (!this.offscreen) {
            this.autoBounds = autoBounds
            this.resizeListener = listener
            try {

                this.resizeObserver = new ResizeObserver((entries) => {
                    for (const entry of entries) this.checkAutoBounds(entry.contentRect)
                })

                const parent = this.parentView
                if (parent) {
                    this.resizeObserver.observe(parent)
                    this.checkAutoBounds(parent.getBoundingClientRect())
                }

            } catch (e) {

                this.imitateResizeObserver()

            }
        }
    }

    protected imitateResizeObserver(): void {
        if (this.autoLayout) {
            if (this.parentView) this.checkAutoBounds(this.parentView.getBoundingClientRect())
            window.requestAnimationFrame(this.imitateResizeObserver.bind(this))
        }
    }

    protected checkAutoBounds(parentSize: ISizeData): void {
        const view = this.view as HTMLCanvasElement
        const { x, y, width, height } = this.autoBounds.getBoundsFrom(parentSize)
        if (width !== this.width || height !== this.height) {
            const { style } = view
            const { pixelRatio } = this
            style.marginLeft = x + 'px'
            style.marginTop = y + 'px'
            const size = { width, height, pixelRatio }
            const oldSize = {} as IScreenSizeData
            DataHelper.copyAttrs(oldSize, this, canvasSizeAttrs)
            this.resize(size)
            if (this.width !== undefined) this.resizeListener(new ResizeEvent(size, oldSize))
        }
    }

    public stopAutoLayout(): void {
        this.autoLayout = false
        this.resizeListener = null
        if (this.resizeObserver) {
            this.resizeObserver.disconnect()
            this.resizeObserver = null
        }
    }

    public unrealCanvas(): void { // App needs to use
        if (!this.unreal && this.parentView) {
            const view = this.view as HTMLCanvasElement
            if (view) view.remove()

            this.view = this.parentView as HTMLCanvasElement
            this.unreal = true
        }
    }

    public destroy(): void {
        if (this.view) {
            this.stopAutoLayout()
            if (!this.unreal && !this.offscreen) {
                const view = this.view as HTMLCanvasElement
                if (view.parentElement) view.remove()
            }
            super.destroy()
        }
    }

}