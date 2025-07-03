import { ICanvasPattern } from '../canvas/ICanvas'
import { IFourNumber, IObject } from '../data/IData'
import { InnerId } from '../event/IEventer'
import { IExportFileType } from '../file/IFileType'
import { IMatrixData } from '../math/IMath'
import { ILeaferCanvas } from '../canvas/ILeaferCanvas'
import { IProgressData } from '../event/IProgress'

export interface ILeaferImageConfig {
    url: string
    thumb?: string
    format?: IExportFileType
    showProgress?: boolean // 是否显示进度
    view?: IObject | ILeaferImage | ILeaferCanvas
}

export interface ILeaferImageOnLoaded {
    (image?: ILeaferImage): any
}

export interface ILeaferImageOnError {
    (error?: string | IObject, image?: ILeaferImage): any
}

export interface ILeaferImageCacheCanvas {
    data: IObject
    params: IArguments
}

export interface ILeaferImagePatternPaint {
    transform: IMatrixData
}

export interface ILeaferImage {
    readonly innerId: InnerId
    readonly url: string

    view: any
    width: number
    height: number

    isSVG: boolean
    hasAlphaPixel: boolean

    readonly completed: boolean
    ready: boolean
    error: IObject
    loading: boolean
    isPlacehold?: boolean // 是否显示占位符，一般在加载100ms后自动判断
    progress: IProgressData // 加载进度

    use: number
    config: ILeaferImageConfig

    load(onSuccess?: ILeaferImageOnLoaded, onError?: ILeaferImageOnError): number
    unload(index: number, stopEvent?: boolean): void
    getFull(filters?: IObject): any
    getCanvas(width: number, height: number, opacity?: number, filters?: IObject, padding?: IFourNumber): any
    getPattern(canvas: any, repeat: string | null, transform?: IMatrixData, paint?: IObject): ICanvasPattern
    destroy(): void
}

export type IImageStatus = 'wait' | 'thumb-loading' | 'thumb-success' | 'thumb-error' | 'loading' | 'success' | 'error' 