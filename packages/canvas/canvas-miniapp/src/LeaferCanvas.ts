import { IResizeEventListener, IAutoBounds, IScreenSizeData, IFunction, IMiniappSelect, IObject, ICanvasContext2D } from '@leafer/interface'
import { LeaferCanvasBase, canvasPatch, canvasSizeAttrs, Platform, DataHelper, ResizeEvent, isString, isNumber, isUndefined } from '@leafer/core'


export class LeaferCanvas extends LeaferCanvasBase {

    public get allowBackgroundColor(): boolean { return false }

    public viewSelect: IMiniappSelect
    public resizeListener: IResizeEventListener

    public testView: any
    public testContext: ICanvasContext2D

    public init(): void {
        const { config } = this
        let view = config.view || config.canvas

        if (view) {
            if (isString(view)) {
                if (view[0] !== '#') view = '#' + view
                this.viewSelect = Platform.miniapp.select(view)
            } else if (view.fields) {
                this.viewSelect = view
            } else {
                this.initView(view)
            }

            if (this.viewSelect) Platform.miniapp.getSizeView(this.viewSelect).then(sizeView => {
                this.initView(sizeView)
            })
        } else {
            this.initView()
        }
    }

    protected initView(view?: IObject): void {
        if (!view) {
            view = {}
            this.__createView()
        } else {
            this.view = view.view || view
        }

        this.view.getContext ? this.__createContext() : this.unrealCanvas()

        const { width, height, pixelRatio } = this.config
        const size = { width: width || view.width, height: height || view.height, pixelRatio }
        this.resize(size)

        if (this.context) {

            if (this.viewSelect) Platform.renderCanvas = this

            // fix roundRect
            if (this.context.roundRect) {
                this.roundRect = function (x: number, y: number, width: number, height: number, radius?: number | number[]): void {
                    this.context.roundRect(x, y, width, height, isNumber(radius) ? [radius] : radius)
                }
            }
            canvasPatch((this.context as IObject).__proto__)
        }
    }

    protected __createView(): void {
        this.view = Platform.origin.createCanvas(1, 1)
    }

    public updateViewSize(): void {
        const { width, height, pixelRatio } = this

        this.view.width = Math.ceil(width * pixelRatio)
        this.view.height = Math.ceil(height * pixelRatio)
    }

    public updateClientBounds(callback?: IFunction): void {
        if (this.viewSelect) Platform.miniapp.getBounds(this.viewSelect).then(bounds => {
            this.clientBounds = bounds
            if (callback) callback()
        })
    }


    public startAutoLayout(autoBounds: IAutoBounds, listener: IResizeEventListener): void {
        this.resizeListener = listener
        if (autoBounds) {
            this.checkSize = this.checkSize.bind(this)
            Platform.miniapp.onWindowResize(this.checkSize)
        }
    }

    public checkSize(): void {
        if (this.viewSelect) {
            setTimeout(() => {
                this.updateClientBounds(() => {
                    const { width, height } = this.clientBounds
                    const { pixelRatio } = this
                    const size = { width, height, pixelRatio }
                    if (!this.isSameSize(size)) this.emitResize(size)
                })
            }, 500)
        }
    }

    public stopAutoLayout(): void {
        this.autoLayout = false
        this.resizeListener = null
        Platform.miniapp.offWindowResize(this.checkSize)
    }

    public unrealCanvas(): void { // App needs to use
        this.unreal = true
    }

    protected emitResize(size: IScreenSizeData): void {
        const oldSize = {} as IScreenSizeData
        DataHelper.copyAttrs(oldSize, this, canvasSizeAttrs)
        this.resize(size)
        if (!isUndefined(this.width)) this.resizeListener(new ResizeEvent(size, oldSize))
    }

}