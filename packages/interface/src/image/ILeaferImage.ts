import { ICanvasPattern } from '../canvas/ICanvas'
import { IObject } from '../data/IData'
import { InnerId } from '../event/IEventer'
import { IExportFileType } from '../file/IFileType'
import { IBoundsData, IMatrixData, IPointData, ISizeData } from '../math/IMath'
import { ILeaferCanvas } from '../canvas/ILeaferCanvas'
import { IProgressData } from '../event/IProgress'
import { IImageCrossOrigin } from '../platform/IPlatform'
import { ITaskItem } from '../task/ITaskProcessor'
import { IRangeSize, IInterlace } from '../display/ILeaf'
import { IFunction } from '../function/IFunction'

export interface ILeaferImageConfig {
    url: string
    lod?: IImageLOD
    format?: IExportFileType
    crossOrigin?: IImageCrossOrigin
    showProgress?: boolean | string // 是否显示进度
    view?: IObject | ILeaferImage | ILeaferCanvas
}

export interface IImageLOD {
    url: string // 'thumb-{level}-{width}-{height}.jpg'
    width: number
    height: number
    thumb?: number
    min?: number
    tile?: IImageTileLOD
}

export interface IImageTileLOD {
    url: string // 'tile-{level}-{index}-{scale}-{x}-{y}-{width}-{height}.jpg'
    size: number
    min?: number
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

export interface ILeaferImageSliceData {
    width: number
    height: number

    total: number
    columns: number
    size: number
    addSize: number

    list?: ILeaferImageSlice[]
}

export interface ILeaferImageSlice {
    view?: any
    bounds?: IBoundsData
    task?: ITaskItem
    destroyed?: boolean
}

export interface ILeaferImageLevel {
    level: number
    scale: number | IPointData
    view?: any
    task?: ITaskItem
    wait?: IFunction[]

    slice?: ILeaferImageSliceData
    use?: number // 引用次数
    destroyed?: boolean
}

export interface ILeaferImage {
    readonly innerId: InnerId
    readonly url: string
    lod?: IImageLOD
    readonly crossOrigin: IImageCrossOrigin

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

    largeThumb?: ILeaferImageLevel
    thumb?: ILeaferImageLevel
    levels?: ILeaferImageLevel[]
    levelsRange?: IRangeSize
    minLevel?: number
    loadId?: ITaskItem

    progress?: IProgressData // 加载进度

    use: number // 引用次数
    config: ILeaferImageConfig

    load(onSuccess?: ILeaferImageOnLoaded, onError?: ILeaferImageOnError, thumbSize?: ISizeData): number
    unload(index: number, stopEvent?: boolean): void
    getFull(filters?: IObject): any
    getCanvas(width: number, height: number, opacity?: number, filters?: IObject, xGap?: number, yGap?: number, smooth?: boolean, interlace?: IInterlace): any
    getPattern(canvas: any, repeat: string | null, transform?: IMatrixData, paint?: IObject): ICanvasPattern

    getLoadUrl(thumbSize?: ISizeData): string
    setThumbView(view: number): void
    getThumbSize(lod?: IImageLOD): ISizeData

    getMinLevel(): number
    getLevelData(level: number, width?: number, height?: number): ILeaferImageLevel
    clearLevels(checkUse?: boolean): void

    destroy(): void
}

export type IImageStatus = 'wait' | 'thumb-loading' | 'thumb-success' | 'thumb-error' | 'loading' | 'success' | 'error' 