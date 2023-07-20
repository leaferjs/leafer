import { IExportFileType, IExportImageType } from '../file/IFileType'

export type ICanvasType = 'skia' | 'canvas'

export interface ISkiaCanvas {
    toBuffer(format: IExportFileType, config: ISkiaCanvasExportConfig): Promise<any>
    toBufferSync(format: IExportFileType, config: ISkiaCanvasExportConfig): any
    toDataURL(format: IExportImageType, config: ISkiaCanvasExportConfig): Promise<string>
    toDataURLSync(format: IExportImageType, config: ISkiaCanvasExportConfig): string
    saveAs(filename: string, config: ISkiaCanvasExportConfig): Promise<void>
    saveAsSync(filename: string, config: ISkiaCanvasExportConfig): void
}

export interface ISkiaCanvasExportConfig {
    page?: number,
    matte?: string,
    density?: number,
    quality?: number,
    outline?: boolean
}