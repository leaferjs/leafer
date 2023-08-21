export * from '@leafer/core'
export * from '@leafer/partner'

export * from '@leafer/canvas-node'
export * from '@leafer/image-web'

import { ICanvasType, ICreator, IExportFileType, IExportImageType, IFunction, IObject, ISkiaCanvas, INapiCanvas } from '@leafer/interface'
import { Platform, Creator } from '@leafer/core'

import { LeaferCanvas } from '@leafer/canvas-node'
import { LeaferImage } from '@leafer/image-node'
import { InteractionBase } from '@leafer/interaction'
// napi-canvas
import {promises} from "fs";
import {join} from "path";


Object.assign(Creator, {
    canvas: (options?, manager?) => new LeaferCanvas(options, manager),
    image: (options) => new LeaferImage(options),
    hitCanvas: (options?, manager?) => new LeaferCanvas(options, manager),

    interaction: (target, canvas, selector, options?) => { return new InteractionBase(target, canvas, selector, options) }
} as ICreator)


export function useCanvas(canvasType: ICanvasType, power: IObject): void {
    if (!Platform.origin) {
        if (canvasType === 'skia') {
            const { Canvas, loadImage } = power
            Platform.origin = {
                createCanvas: (width: number, height: number, format?: string) => new Canvas(width, height, format),
                canvasToDataURL: (canvas: ISkiaCanvas, type?: IExportImageType, quality?: number) => canvas.toDataURLSync(type, { quality }),
                canvasToBolb: (canvas: ISkiaCanvas, type?: IExportFileType, quality?: number) => canvas.toBuffer(type, { quality }),
                canvasSaveAs: (canvas: ISkiaCanvas, filename: string, quality?: any) => canvas.saveAs(filename, { quality }),
                loadImage
            }
        }

        if (canvasType === 'napi') {
            const { Canvas, loadImage } = power
            Platform.origin = {
                createCanvas: (width: number, height: number, format?: string) => new Canvas(width, height, format),
                canvasToDataURL: (canvas: INapiCanvas, type?: IExportImageType, quality?: number) => canvas.toDataURL(`image/${type == "jpg" ? "jpeg" : type}`, quality),
                canvasToBolb: (canvas: INapiCanvas, type?: IExportImageType, quality?: number) => {
                    if (type == "png") return canvas.toBuffer('image/png')
                    return canvas.toBuffer(`image/${type == "jpg" ? "jpeg" : type}`, quality)
                },
                canvasSaveAs: (canvas: INapiCanvas, filename: string, quality?: any) => canvas.encode("png").then(data => promises.writeFile(join(__dirname, filename), data)),
                loadImage
            }
        }
        Platform.canvas = Creator.canvas()
    }
}

Platform.name = 'node'
Platform.requestRender = function (render: IFunction): void { setTimeout(render) }
Platform.devicePixelRatio = 1
Platform.conicGradientSupport = true
Platform.realtimeLayout = true
