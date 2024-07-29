import { IExportFileType, IExportImageType } from '../file/IFileType'

export type ICanvasType = 'skia' | 'napi' | 'canvas' | 'miniapp'

// skia
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

// skia-napi
export interface ISkiaNAPICanvas {
    encodeSync(format: 'webp' | 'jpeg', quality?: number): any
    encodeSync(format: 'png'): any

    encode(format: 'webp' | 'jpeg' | string, quality?: number): Promise<any>
    encode(format: 'png'): Promise<any>

    toBuffer(mime: 'image/png'): any
    toBuffer(mime: 'image/jpeg' | 'image/webp' | string, quality?: number): any

    toDataURL(mime?: 'image/png'): string
    toDataURL(mime: 'image/jpeg' | 'image/webp' | string, quality?: number): string

    toDataURLAsync(mime?: 'image/png'): Promise<string>
    toDataURLAsync(mime: 'image/jpeg' | 'image/webp' | string, quality?: number): Promise<string>
}