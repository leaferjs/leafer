import { ILeafer, ILeaferCanvasConfig, IImageManager, ILeaferImageConfig, ILeaferImage } from '@leafer/interface'
import { Creator } from '@leafer/platform'


interface ILeaferImageMap {
    [name: string]: ILeaferImage
}


export class ImageManager implements IImageManager {

    public leafer: ILeafer

    public map: ILeaferImageMap = {}

    constructor(leafer: ILeafer, _config: ILeaferCanvasConfig) {
        this.leafer = leafer
    }

    public get(config: ILeaferImageConfig): ILeaferImage {
        let image = this.map[config.url]
        if (!image) {
            image = Creator.image(config)
            this.map[config.url] = image
        }
        return image
    }

    public destory(): void {
        this.leafer = null
        this.map = null
    }

}