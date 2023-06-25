import { ILeaferImage, ILeaferImageConfig } from './ILeaferImage'


export interface IImageManager {
    get(config: ILeaferImageConfig): ILeaferImage
    destory(): void
}