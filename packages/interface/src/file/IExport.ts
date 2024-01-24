import { IBlob, ILeaferCanvas } from '../canvas/ILeaferCanvas'
import { IBoundsData } from '../math/IMath'


export interface IExportOptions {
    quality?: number
    blob?: boolean
    pixelRatio?: number
    slice?: boolean
    fill?: string
    screenshot?: IBoundsData | boolean
}

export interface IExportResult {
    data: ILeaferCanvas | IBlob | string | boolean
}

export interface IExportResultFunction {
    (data: IExportResult): void
}