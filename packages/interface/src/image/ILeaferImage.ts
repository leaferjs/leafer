import { ICanvasPattern } from '../canvas/ICanvas'
import { IObject } from '../data/IData'
import { InnerId } from '../event/IEventer'
import { IExportFileType } from '../file/IFileType'
import { IMatrixData } from '../math/IMath'
import { ILeaferCanvas } from '../canvas/ILeaferCanvas'

export interface ILeaferImageConfig {
    url: string
    thumb?: string
    format?: IExportFileType
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

    view: unknown
    width: number
    height: number

    isSVG: boolean
    hasOpacityPixel: boolean

    readonly completed: boolean
    ready: boolean
    error: IObject
    loading: boolean

    use: number
    config: ILeaferImageConfig

    load(onSuccess?: ILeaferImageOnLoaded, onError?: ILeaferImageOnError): number
    unload(index: number, stopEvent?: boolean): void
    getCanvas(width: number, height: number, opacity?: number, _filters?: IObject): unknown
    getPattern(canvas: any, repeat: string | null, transform?: IMatrixData, paint?: IObject): ICanvasPattern
    destroy(): void
}

export type IImageStatus = 'wait' | 'thumb-loading' | 'thumb-success' | 'thumb-error' | 'loading' | 'success' | 'error' 