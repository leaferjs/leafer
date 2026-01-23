import { IBlob, ILeaferCanvas } from '../canvas/ILeaferCanvas'
import { ICanvasContext2DSettings } from '../canvas/ICanvas'
import { ILeaf } from '../display/ILeaf'
import { ILocationType } from '../layout/ILeafLayout'
import { IBoundsData, IBoundsDataWithOptionRotation, IOptionSizeData, IPointData } from '../math/IMath'
import { IFourNumber } from '../data/IData'

export interface IExportOptions {
    quality?: number
    blob?: boolean

    scale?: number | IPointData
    size?: number | IOptionSizeData

    clip?: IBoundsDataWithOptionRotation

    padding?: IFourNumber
    smooth?: boolean
    pixelRatio?: number

    slice?: boolean
    trim?: boolean
    fill?: string
    screenshot?: IBoundsData | boolean
    relative?: ILocationType | ILeaf
    json?: IJSONOptions
    contextSettings?: ICanvasContext2DSettings
    canvas?: ILeaferCanvas
    onCanvas?: IExportOnCanvasFunction
}

export interface IJSONOptions {
    matrix?: boolean
}

export interface IExportResult {
    data: ILeaferCanvas | IBlob | string | boolean
    width?: number
    height?: number
    renderBounds?: IBoundsData
    trimBounds?: IBoundsData
    error?: any
}

export interface IExportResultFunction {
    (data: IExportResult): void
}

export interface IExportOnCanvasFunction {
    (data: ILeaferCanvas): void
}