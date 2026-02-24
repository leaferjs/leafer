import { ITaskProcessor } from '../task/ITaskProcessor'
import { ILeaferImage } from '../image/ILeaferImage'
import { IExportFileType, IFilmFileType, IVideoFileType } from './IFileType'
import { IObject } from '../data/IData'
import { ILeaferCanvas } from '../canvas/ILeaferCanvas'
import { ILeaferFilm } from '../image/ILeaferFilm'
import { ILeaferVideo } from '../image/ILeaferVideo'


export interface IResource {
    map: any,
    tasker: ITaskProcessor
    readonly isComplete: boolean

    set(key: string, value: any): void
    get(key: string): any
    remove(key: string): void

    setImage(key: string, value: string | IObject | ILeaferImage | ILeaferCanvas, format?: IExportFileType): ILeaferImage
    loadImage(key: string, format?: IExportFileType): Promise<ILeaferImage>

    loadFilm(key: string, format?: IFilmFileType): Promise<ILeaferFilm>
    loadVideo(key: string, format?: IVideoFileType): Promise<ILeaferVideo>

    destroy(): void
}
