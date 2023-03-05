import { ILeaferCanvas, ILeafer, ILeaferCanvasConfig, IImageManager } from '@leafer/interface'

export class ImageManager implements IImageManager {

    public leafer: ILeafer

    public list: ILeaferCanvas[] = []

    constructor(leafer: ILeafer, config: ILeaferCanvasConfig) {
        this.leafer = leafer
    }

    public load(): void {

    }

    public destory(): void {
        this.leafer = undefined
    }

}