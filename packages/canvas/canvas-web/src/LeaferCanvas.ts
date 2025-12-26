import { IAutoBounds, ISizeData, IScreenSizeData, IResizeEventListener, IFunction } from '@leafer/interface'
import { LeaferCanvasBase, canvasSizeAttrs, ResizeEvent, DataHelper, Platform, Debug, isString, isUndefined } from '@leafer/core'


const debug = Debug.get('LeaferCanvas')

export class LeaferCanvas extends LeaferCanvasBase {

    declare public view: HTMLCanvasElement
    declare public parentView: HTMLElement

    public set zIndex(zIndex: number) {
        const { style } = this.view
        style.zIndex = zIndex as unknown as string
        this.setAbsolute(this.view)
    }

    public set childIndex(index: number) {
        const { view, parentView } = this
        if (view && parentView) {
            const beforeNode = parentView.children[index]
            if (beforeNode) {
                this.setAbsolute(beforeNode as HTMLCanvasElement)
                parentView.insertBefore(view, beforeNode)
            } else {
                parentView.appendChild(beforeNode)
            }
        }
    }

    protected resizeObserver: ResizeObserver
    protected autoBounds: IAutoBounds
    protected resizeListener: IResizeEventListener
    protected windowListener: IFunction

    public init(): void {
        const { config } = this
        const view = config.view || config.canvas

        view ? this.__createViewFrom(view) : this.__createView()
        const { style } = this.view
        style.display || (style.display = 'block')
        this.parentView = this.view.parentElement

        if (this.parentView) {
            const pStyle = this.parentView.style
            pStyle.webkitUserSelect = pStyle.userSelect = 'none' // fix safari: use webkitUserSelect
            this.view.classList.add('leafer-canvas-view')
        }

        if (Platform.syncDomFont && !this.parentView) { // fix: firefox default font
            style.display = 'none'
            if (document.body) document.body.appendChild(this.view)
        }

        this.__createContext()

        if (!this.autoLayout) this.resize(config as IScreenSizeData)
    }

    public set backgroundColor(color: string) { this.view.style.backgroundColor = color }
    public get backgroundColor(): string { return this.view.style.backgroundColor }

    public set hittable(hittable: boolean) { this.view.style.pointerEvents = hittable ? 'auto' : 'none' }
    public get hittable() { return this.view.style.pointerEvents !== 'none' }

    protected __createView(): void {
        this.view = document.createElement('canvas')
    }

    protected __createViewFrom(inputView: string | object): void {
        let find: unknown = isString(inputView) ? document.getElementById(inputView) : inputView as HTMLElement
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
                    this.setAbsolute(view)
                    parent.style.position || (parent.style.position = 'relative')
                }

                parent.appendChild(view)
            }
        } else {
            debug.error(`no id: ${inputView}`)
            this.__createView()
        }
    }

    protected setAbsolute(view: HTMLCanvasElement): void {
        const { style } = view
        style.position = 'absolute'
        style.top = style.left = '0px'
    }

    public updateViewSize(): void {
        const { width, height, pixelRatio } = this
        const { style } = this.view

        style.width = width + 'px'
        style.height = height + 'px'

        if (!this.unreal) {
            this.view.width = Math.ceil(width * pixelRatio)
            this.view.height = Math.ceil(height * pixelRatio)
        }
    }


    public updateClientBounds(): void {
        if (this.view.parentElement) this.clientBounds = this.view.getBoundingClientRect()
    }

    public startAutoLayout(autoBounds: IAutoBounds, listener: IResizeEventListener): void {
        this.resizeListener = listener

        if (autoBounds) {  // check auto layout

            this.autoBounds = autoBounds

            if (this.resizeObserver) return

            try {

                this.resizeObserver = new ResizeObserver((entries) => {
                    this.updateClientBounds()
                    for (const entry of entries) this.checkAutoBounds(entry.contentRect)
                })

                const parent = this.parentView
                if (parent) {
                    this.resizeObserver.observe(parent)
                    this.checkAutoBounds(parent.getBoundingClientRect())
                } else {
                    this.checkAutoBounds(this.view)
                    debug.warn('no parent')
                }

            } catch {

                this.imitateResizeObserver()

            }

            this.stopListenPixelRatio()

        } else {

            this.listenPixelRatio()
            if (this.unreal) this.updateViewSize() // must update

        }

    }

    protected imitateResizeObserver(): void {
        if (this.autoLayout) {
            if (this.parentView) this.checkAutoBounds(this.parentView.getBoundingClientRect())
            Platform.requestRender(this.imitateResizeObserver.bind(this))
        }
    }

    // check devicePixelRatio change

    protected listenPixelRatio() {
        if (!this.windowListener) window.addEventListener('resize', this.windowListener = () => {
            const pixelRatio = Platform.devicePixelRatio
            if (!this.config.pixelRatio && this.pixelRatio !== pixelRatio) {
                const { width, height } = this
                this.emitResize({ width, height, pixelRatio })
            }
        })
    }

    protected stopListenPixelRatio() {
        if (this.windowListener) {
            window.removeEventListener('resize', this.windowListener)
            this.windowListener = null
        }
    }

    protected checkAutoBounds(parentSize: ISizeData): void {
        const view = this.view
        const { x, y, width, height } = this.autoBounds.getBoundsFrom(parentSize)
        const size = { width, height, pixelRatio: this.config.pixelRatio ? this.pixelRatio : Platform.devicePixelRatio } as IScreenSizeData
        if (!this.isSameSize(size)) {
            const { style } = view
            style.marginLeft = x + 'px'
            style.marginTop = y + 'px'
            this.emitResize(size)
        }
    }

    public stopAutoLayout(): void {
        this.autoLayout = false
        if (this.resizeObserver) this.resizeObserver.disconnect()
        this.resizeListener = this.resizeObserver = null
    }

    protected emitResize(size: IScreenSizeData): void {
        const oldSize = {} as IScreenSizeData
        DataHelper.copyAttrs(oldSize, this, canvasSizeAttrs)
        this.resize(size)
        if (this.resizeListener && !isUndefined(this.width)) this.resizeListener(new ResizeEvent(size, oldSize))
    }


    public unrealCanvas(): void { // App needs to use
        if (!this.unreal && this.parentView) { // canvas 替换成 div, 方便放入子canvas
            let view = this.view
            if (view) view.remove()

            view = this.view = document.createElement('div') as any
            this.parentView.appendChild(this.view)
            view.classList.add('leafer-app-view')

            this.unreal = true
        }
    }

    public destroy(): void {
        const { view } = this
        if (view) {
            this.stopAutoLayout()
            this.stopListenPixelRatio()
            if (view.parentElement) view.remove()
            super.destroy()
        }
    }

}