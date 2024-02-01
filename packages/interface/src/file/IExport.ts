import { IBlob, ILeaferCanvas } from '../canvas/ILeaferCanvas'
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