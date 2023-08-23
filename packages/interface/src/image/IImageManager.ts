import { ILeaferImage, ILeaferImageConfig } from './ILeaferImage'
import { ITaskProcessor } from '../task/ITaskProcessor'

interface ILeaferImageMap {
    [name: string]: ILeaferImage
}

export interface IImageManager {
    map: ILeaferImageMap
    tasker: ITaskProcessor
    patternTasker: ITaskProcessor
    get(config: ILeaferImageConfig): ILeaferImage
    recycle(image: ILeaferImage): void
    clearRecycled(): void
    destroy(): void
}