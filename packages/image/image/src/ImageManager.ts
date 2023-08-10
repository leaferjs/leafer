import { ILeafer, ILeaferCanvasConfig, IImageManager, ILeaferImageConfig, ILeaferImage, ITaskProcessor, IFunction } from '@leafer/interface'
import { Creator } from '@leafer/platform'
import { TaskProcessor } from '@leafer/task'


interface ILeaferImageMap {
    [name: string]: ILeaferImage
}


export class ImageManager implements IImageManager {

    public leafer: ILeafer

    public tasker: ITaskProcessor

    public map: ILeaferImageMap = {}

    constructor(leafer: ILeafer, _config: ILeaferCanvasConfig) {
        this.leafer = leafer
        this.tasker = new TaskProcessor()
    }

    public get(config: ILeaferImageConfig): ILeaferImage {
        let image = this.map[config.url]
        if (!image) {
            image = Creator.image(config)
            this.map[config.url] = image
        }
        return image
    }

    public load(image: ILeaferImage, onSuccess: IFunction, onError: IFunction): void {
        this.tasker.addParallel(async () => await image.load(onSuccess, onError), null, true)
    }

    public destroy(): void {
        this.leafer = null
        this.map = null
    }

}