import { ITaskProcessor } from '../task/ITaskProcessor'
import { ILeaferImage } from '../image/ILeaferImage'
import { IExportFileType } from './IFileType'
import { IObject } from '../data/IData'
import { ILeaferCanvas } from '../canvas/ILeaferCanvas'


export interface IResource {
    map: any,
    tasker: ITaskProcessor
    readonly isComplete: boolean

    set(key: string, value: any): void
    get(key: string): any
    remove(key: string): void

    setImage(key: string, value: string | IObject | ILeaferImage | ILeaferCanvas, format?: IExportFileType): ILeaferImage
    loadImage(key: string, format?: IExportFileType): Promise<ILeaferImage>

    destroy(): void
}
