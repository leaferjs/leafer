import { IAutoBounds, ISizeData, IScreenSizeData, IResizeEventListener, ICursorType } from '@leafer/interface'
import { LeaferCanvasBase, canvasSizeAttrs, ResizeEvent, DataHelper, Platform, Debug, Cursor } from '@leafer/core'


const debug = Debug.get('LeaferCanvas')

export class LeaferCanvas extends LeaferCanvasBase {

    declare public view: HTMLCanvasElement
    declare public parentView: HTMLElement

    protected resizeObserver: ResizeObserver
    protected autoBounds: IAutoBounds
    protected resizeListener: IResizeEventListener

    public init(): void {
        const { view } = this.config

        view ? this.__createViewFrom(view) : this.__createView()
        const { style } = this.view
        style.display || (style.display = 'block')
        this.parentView = this.view.parentElement
        if (this.parentView) this.parentView.style.userSelect = 'none'

        if (Platform.syncDomFont && !this.parentView) { // fix: firefox default font
            this.view.style.display = 'none'
            document.body.appendChild(this.view)
        }

        this.__createContext()

        if (!this.autoLayout) this.resize(this.config as IScreenSizeData)
    }

    public set backgroundColor(color: string) { this.view.style.backgroundColor = color }
    public get backgroundColor(): string { return this.view.style.backgroundColor }

    public set hittable(hittable: boolean) { this.view.style.pointerEvents = hittable ? 'auto' : 'none' }
    public get hittable() { return this.view.style.pointerEvents !== 'none' }

    protected __createView(): void {
        this.view = document.createElement('canvas')
    }

    public setCursor(cursor: ICursorType | ICursorType[]): void {
        const list: ICursorType[] = []
        this.eachCursor(cursor, list)
        if (typeof list[list.length - 1] === 'object') list.push('default')
        this.view.style.cursor = list.map(item => (typeof item === 'object') ? `url(${item.url}) ${item.x || 0} ${item.y || 0}` : item).join(',')
    }

    protected eachCursor(cursor: ICursorType | ICursorType[], list: ICursorType[], level = 0): void {
        level++
        if (cursor instanceof Array) {
            cursor.forEach(item => this.eachCursor(item, list, level))
        } else {
            const custom = typeof cursor === 'string' && Cursor.get(cursor)
            if (custom && level < 2) {
                this.eachCursor(custom, list, level)
            } else {
                list.push(cursor)
            }
        }
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
                const view = this.view

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

        const { style } = this.view
        style.width = width + 'px'
        style.height = height + 'px'

        this.view.width = width * pixelRatio
        this.view.height = height * pixelRatio
    }

    public updateClientBounds(): void {
        this.clientBounds = this.view.getBoundingClientRect()
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
        const view = this.view
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
            const view = this.view
            if (view) view.remove()

            this.view = this.parentView as HTMLCanvasElement
            this.unreal = true
        }
    }

    public destroy(): void {
        if (this.view) {
            this.stopAutoLayout()
            if (!this.unreal) {
                const view = this.view
                if (view.parentElement) view.remove()
            }
            super.destroy()
        }
    }

}