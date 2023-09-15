import { IAutoBounds, ISizeData, IScreenSizeData, IResizeEventListener, ICursorType } from '@leafer/interface'
import { LeaferCanvasBase, canvasSizeAttrs } from '@leafer/canvas'
import { ResizeEvent } from '@leafer/event'
import { DataHelper } from '@leafer/data'
import { Platform } from '@leafer/platform'
import { Debug } from '@leafer/debug'


const debug = Debug.get('LeaferCanvas')

export class LeaferCanvas extends LeaferCanvasBase {

    public view: HTMLCanvasElement
    public parentView: HTMLElement

    protected resizeObserver: ResizeObserver
    protected autoBounds: IAutoBounds
    protected resizeListener: IResizeEventListener

    public init(): void {
        const { view } = this.config

        view ? this.__createViewFrom(view) : this.__createView()
        const { style } = this.view as HTMLCanvasElement
        style.display || (style.display = 'block')
        this.parentView = (this.view as HTMLCanvasElement).parentElement

        if (Platform.syncDomFont && !this.parentView) { // fix: firefox default font
            this.view.style.display = 'none'
            document.body.appendChild(this.view)
        }

        this.__createContext()

        if (!this.autoLayout) this.resize(this.config as IScreenSizeData)
    }

    public set backgroundColor(color: string) { (this.view as HTMLElement).style.backgroundColor = color }
    public get backgroundColor(): string { return (this.view as HTMLElement).style.backgroundColor }

    public set hittable(hittable: boolean) { (this.view as HTMLElement).style.pointerEvents = hittable ? 'auto' : 'none' }
    public get hittable() { return (this.view as HTMLElement).style.pointerEvents !== 'none' }

    protected __createView(): void {
        this.view = document.createElement('canvas')
    }

    public setCursor(cursor: ICursorType | ICursorType[]): void {
        if (!(cursor instanceof Array)) cursor = [cursor]
        if (typeof cursor[cursor.length - 1] === 'object') cursor.push('default')
        this.view.style.cursor = cursor.map(item => (typeof item === 'object') ? `url(${item.url}) ${item.x || 0} ${item.y || 0}` : item).join(',')
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

    public updateViewSize(): void {
        const { width, height, pixelRatio } = this

        const { style } = this.view as HTMLCanvasElement
        style.width = width + 'px'
        style.height = height + 'px'

        this.view.width = width * pixelRatio
        this.view.height = height * pixelRatio

    }

    public updateClientBounds(): void {
        this.clientBounds = (this.view as HTMLCanvasElement).getBoundingClientRect()
    }

    public startAutoLayout(autoBounds: IAutoBounds, listener: IResizeEventListener): void {
        this.autoBounds = autoBounds
        this.resizeListener = listener
        try {

            this.resizeObserver = new ResizeObserver((entries) => {
                this.updateClientBounds()
                for (const entry of entries) this.checkAutoBounds(entry.contentRect)
            })

            const parent = this.parentView
            if (parent) {
                this.resizeObserver.observe(parent)
                this.checkAutoBounds(parent.getBoundingClientRect())
            }

        } catch {

            this.imitateResizeObserver()

        }
    }

    protected imitateResizeObserver(): void {
        if (this.autoLayout) {
            if (this.parentView) this.checkAutoBounds(this.parentView.getBoundingClientRect())
            Platform.requestRender(this.imitateResizeObserver.bind(this))
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
            if (!this.unreal) {
                const view = this.view as HTMLCanvasElement
                if (view.parentElement) view.remove()
            }
            super.destroy()
        }
    }

}