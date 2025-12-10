import { ILeaferImage, ILeaferImageConfig } from './ILeaferImage'
import { ITaskProcessor } from '../task/ITaskProcessor'
import { IExportFileType } from '../file/IFileType'


export interface IImageManager {
    maxRecycled: number
    recycledList: ILeaferImage[]

    patternTasker: ITaskProcessor
    patternLocked?: boolean // 锁定pattern不更新, 一般用于创建碰撞位图 UIHit.ts

    get(config: ILeaferImageConfig): ILeaferImage
    recycle(image: ILeaferImage): void

    recyclePaint(paint: any): void

    clearRecycled(force?: boolean): void
    clearLevels(): void

    hasAlphaPixel(config: ILeaferImageConfig): boolean // png / svg / webp
    isFormat(format: IExportFileType, config: ILeaferImageConfig): boolean

    destroy(): void
}