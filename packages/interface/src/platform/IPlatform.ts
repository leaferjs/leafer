import { IFunction } from '../function/IFunction'
import { ILeaferCanvas } from '../canvas/ILeaferCanvas'
import { ILeaf } from '../display/ILeaf'
import { IExportFileType, IExportImageType } from '../file/IFileType'

export interface IPlatform {
    requestRender?(render: IFunction): void
    canvas?: ILeaferCanvas
    isWorker?: boolean
    devicePixelRatio?: number
    intWheelDeltaY?: boolean // firxfox need
    conicGradientSupport?: boolean
    conicGradientRotate90?: boolean // fixfox need rotate
    fullImageShadow?: boolean // safari need 
    layout?(target: ILeaf): void
    origin?: {
        createCanvas(width: number, height: number, format?: 'svg' | 'pdf'): any
        canvasToDataURL(canvas: any, type?: IExportImageType, quality?: number): string
        canvasToBolb(canvas: any, type?: IExportFileType, quality?: number): Promise<any>
        canvasSaveAs(canvas: any, filename: string, quality?: number): Promise<void>
        loadImage(url: string): Promise<any>
    }
}