import { ILeaferImage, ILeaferImageConfig } from './ILeaferImage'
import { ITaskProcessor } from '../task/ITaskProcessor'
import { IExportFileType } from '../file/IFileType'


export interface IImageManager {
    patternTasker: ITaskProcessor
    patternLocked?: boolean // 锁定pattern不更新, 一般用于创建碰撞位图 UIHit.ts
    recycledList: ILeaferImage[]

    get(config: ILeaferImageConfig): ILeaferImage
    recycle(image: ILeaferImage): void
    clearRecycled(): void
    hasOpacityPixel(config: ILeaferImageConfig): boolean // png / svg / webp
    isFormat(format: IExportFileType, config: ILeaferImageConfig): boolean

    destroy(): void
}