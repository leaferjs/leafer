import { IObject } from '../data/IData'

export interface ILeaferImageConfig {
    url: string
    thumb?: string
}

export interface ILeaferImageOnLoaded {
    (image?: ILeaferImage): any
}

export interface ILeaferImageOnError {
    (error?: string | IObject, image?: ILeaferImage): any
}

export interface ILeaferImage {
    view: unknown
    width: number
    height: number
    ready: boolean
    load(onSuccess?: ILeaferImageOnLoaded, onError?: ILeaferImageOnError): void
    getCanvas(width: number, height: number, opacity?: number, _filters?: IObject): unknown
}

export type IImageStatus = 'wait' | 'thumb-loading' | 'thumb-success' | 'thumb-error' | 'loading' | 'success' | 'error' 