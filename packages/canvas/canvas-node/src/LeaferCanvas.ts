import { IObject, IScreenSizeData } from '@leafer/interface'
import { LeaferCanvasBase, Platform, canvasPatch } from '@leafer/core'

export class LeaferCanvas extends LeaferCanvasBase {

    public get allowBackgroundColor(): boolean { return true }

    public init(): void {

        this.__createView()
        this.__createContext()

        this.resize(this.config as IScreenSizeData)

        if (Platform.roundRectPatch) {
            (this.context as IObject).__proto__.roundRect = null
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

        this.clientBounds = this.bounds
    }

}