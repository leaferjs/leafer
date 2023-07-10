export * from '@leafer/core'
export * from '@leafer/partner'

export * from '@leafer/canvas-node'
export * from '@leafer/image-web'

import { ICreator, IExportFileType, IExportImageType, IFunction, IObject, ISkiaCanvas } from '@leafer/interface'
import { Platform, Creator } from '@leafer/core'

import { LeaferCanvas } from '@leafer/canvas-node'
import { LeaferImage } from '@leafer/image-node'
import { InteractionBase } from '@leafer/interaction'


Object.assign(Creator, {
    canvas: (options?, manager?) => new LeaferCanvas(options, manager),
    image: (options) => new LeaferImage(options),
    hitCanvas: (options?, manager?) => new LeaferCanvas(options, manager),

    interaction: (target, canvas, selector, options?) => { return new InteractionBase(target, canvas, selector, options) }
} as ICreator)


export function useSkiaCanvas(skia: IObject): void {
    const { Canvas, loadImage } = skia
    Platform.origin = {
        createCanvas: (width: number, height: number, format?: string) => new Canvas(width, height, format),
        canvasToDataURL: (canvas: ISkiaCanvas, type?: IExportImageType, quality?: number) => canvas.toDataURLSync(type, { quality }),
        canvasToBolb: (canvas: ISkiaCanvas, type?: IExportFileType, quality?: number) => canvas.toBuffer(type, { quality }),
        canvasSaveAs: (canvas: ISkiaCanvas, filename: string, quality?: any) => canvas.saveAs(filename, { quality }),
        loadImage
    }
    Platform.canvas = Creator.canvas()
}

Platform.requestRender = function (render: IFunction): void { setTimeout(render) }
Platform.devicePixelRatio = devicePixelRatio
Platform.conicGradientSupport = true
