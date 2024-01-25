import { IBlob, ILeaferCanvas } from '../canvas/ILeaferCanvas'
import { IBoundsData } from '../math/IMath'


export interface IExportOptions {
    quality?: number
    blob?: boolean
    pixelRatio?: number
    slice?: boolean
    trim?: boolean
    fill?: string
    screenshot?: IBoundsData | boolean

}

export interface IExportResult {
    data: ILeaferCanvas | IBlob | string | boolean
    localRenderBounds?: IBoundsData
    trimBounds?: IBoundsData
}

export interface IExportResultFunction {
    (data: IExportResult): void
}