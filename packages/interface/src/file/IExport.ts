import { IBlob, ILeaferCanvas } from '../canvas/ILeaferCanvas'
import { ICanvasContext2DSettings } from '../canvas/ICanvas'
import { ILeaf } from '../display/ILeaf'
import { ILocationType } from '../layout/ILeafLayout'
import { IBoundsData } from '../math/IMath'

export interface IExportOptions {
    quality?: number
    blob?: boolean
    scale?: number
    smooth?: boolean
    pixelRatio?: number
    slice?: boolean
    trim?: boolean
    fill?: string
    screenshot?: IBoundsData | boolean
    relative?: ILocationType | ILeaf
    contextSettings?: ICanvasContext2DSettings
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