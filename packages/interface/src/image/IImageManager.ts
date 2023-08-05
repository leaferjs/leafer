import { ILeaferImage, ILeaferImageConfig } from './ILeaferImage'
import { ITaskProcessor } from '../task/ITaskProcessor'
import { IFunction } from '../function/IFunction'

export interface IImageManager {
    tasker: ITaskProcessor
    get(config: ILeaferImageConfig): ILeaferImage
    load(image: ILeaferImage, onSuccess: IFunction, onError: IFunction): void
    destroy(): void
}