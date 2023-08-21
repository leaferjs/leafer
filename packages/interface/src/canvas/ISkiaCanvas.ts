import { IExportFileType, IExportImageType } from '../file/IFileType'

export type ICanvasType = 'skia' | 'napi' | 'canvas' | 'wx'

export interface ISkiaCanvas {
    toBuffer(format: IExportFileType, config: ISkiaCanvasExportConfig): Promise<any>
    toBufferSync(format: IExportFileType, config: ISkiaCanvasExportConfig): any
    toDataURL(format: IExportImageType, config: ISkiaCanvasExportConfig): Promise<string>
    toDataURLSync(format: IExportImageType, config: ISkiaCanvasExportConfig): string
    saveAs(filename: string, config: ISkiaCanvasExportConfig): Promise<void>
    saveAsSync(filename: string, config: ISkiaCanvasExportConfig): void
}

export interface INapiCanvas {
    encode(format: 'webp' | 'jpeg', quality?: number): Promise<any>
    encode(format: 'png'): Promise<any>
    toBuffer(mime: 'image/png'): any
    toBuffer(mime: 'image/jpeg' | 'image/webp', quality?: number): any
    toDataURL(mime?: 'image/png'): string
    toDataURL(mime: 'image/jpeg' | 'image/webp', quality?: number): string
    toDataURL(mime?: 'image/jpeg' | 'image/webp' | 'image/png', quality?: number): string
    toDataURLAsync(mime?: 'image/png'): Promise<string>
    toDataURLAsync(mime: 'image/jpeg' | 'image/webp', quality?: number): Promise<string>
    toDataURLAsync(mime?: 'image/jpeg' | 'image/webp' | 'image/png', quality?: number): Promise<string>
}

export interface ISkiaCanvasExportConfig {
    page?: number,
    matte?: string,
    density?: number,
    quality?: number,
    outline?: boolean
}
