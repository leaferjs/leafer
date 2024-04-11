import { ILeaferImage, ILeaferImageConfig } from './ILeaferImage'
import { ITaskProcessor } from '../task/ITaskProcessor'
import { IExportFileType } from '../file/IFileType'

interface ILeaferImageMap {
    [name: string]: ILeaferImage
}

export interface IImageManager {
    map: ILeaferImageMap
    recycledList: ILeaferImage[]
    tasker: ITaskProcessor
    patternTasker: ITaskProcessor
    patternLocked?: boolean // 锁定pattern不更新, 一般用于创建碰撞位图
    readonly isComplete: boolean
    get(config: ILeaferImageConfig): ILeaferImage
    recycle(image: ILeaferImage): void
    clearRecycled(): void
    hasOpacityPixel(config: ILeaferImageConfig): boolean // png / svg / webp
    isFormat(format: IExportFileType, config: ILeaferImageConfig): boolean
    destroy(): void
}