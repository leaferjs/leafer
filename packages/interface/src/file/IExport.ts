import { IBlob, ILeaferCanvas } from '../canvas/ILeaferCanvas'
import { ILocationType } from '../layout/ILeafLayout'
import { IBoundsData } from '../math/IMath'


export interface IExportOptions {
    quality?: number
    blob?: boolean
    scale?: number
    pixelRatio?: number
    slice?: boolean
    trim?: boolean
    fill?: string
    screenshot?: IBoundsData | boolean
    location?: ILocationType
    onCanvas?: IExportOnCanvasFunction
}

export interface IExportResult {
    data: ILeaferCanvas | IBlob | string | boolean
    width?: number
    height?: number
    renderBounds?: IBoundsData
    trimBounds?: IBoundsData
}

export interface IExportResultFunction {
    (data: IExportResult): void
}

export interface IExportOnCanvasFunction {
    (data: ILeaferCanvas): void
}