import { IObject, IScreenSizeData } from '@leafer/interface'
import { LeaferCanvasBase, Platform } from '@leafer/core'

export class LeaferCanvas extends LeaferCanvasBase {

    public view: IObject

    public get allowBackgroundColor(): boolean { return true }

    public init(): void {

        this.__createView()
        this.__createContext()

        this.resize(this.config as IScreenSizeData)
    }

    protected __createView(): void {
        this.view = Platform.origin.createCanvas(1, 1)
    }

    public updateViewSize(): void {
        const { width, height, pixelRatio } = this

        this.view.width = width * pixelRatio
        this.view.height = height * pixelRatio

        this.clientBounds = this.bounds
    }

}