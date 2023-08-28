export * from '@leafer/core'
export * from '@leafer/partner'

export * from '@leafer/canvas-worker'
export * from '@leafer/image-worker'

import { ICreator, IFunction, IExportImageType, IExportFileType, IObject, ICanvasType } from '@leafer/interface'
import { Platform, Creator, FileHelper } from '@leafer/core'

import { LeaferCanvas } from '@leafer/canvas-worker'
import { LeaferImage } from '@leafer/image-worker'
import { InteractionBase } from '@leafer/interaction'


const { mineType } = FileHelper


Object.assign(Creator, {
    canvas: (options?, manager?) => new LeaferCanvas(options, manager),
    image: (options) => new LeaferImage(options),
    hitCanvas: (options?, manager?) => new LeaferCanvas(options, manager),

    interaction: (target, canvas, selector, options?) => new InteractionBase(target, canvas, selector, options),
} as ICreator)


export function useCanvas(_canvasType: ICanvasType, _power?: IObject): void {
    Platform.origin = {
        createCanvas: (width: number, height: number): OffscreenCanvas => new OffscreenCanvas(width, height),
        canvasToDataURL: (_canvas: OffscreenCanvas, _type?: IExportImageType, _quality?: number) => '',
        canvasToBolb: (canvas: OffscreenCanvas, type?: IExportFileType, quality?: number) => canvas.convertToBlob({ type: mineType(type), quality }),
        canvasSaveAs: (_canvas: OffscreenCanvas, _filename: string, _quality?: any) => {
            return new Promise((resolve) => {
                resolve()
            })
        },
        loadImage(src: any): Promise<ImageBitmap> {
            return new Promise((resolve, reject) => {
                if (src.startsWith('data:')) {

                } else {
                    src += src.includes("?") ? "&xhr" : "?xhr" // 需要带上xhr区分image标签的缓存，否则导致浏览器跨域问题
                    let req = new XMLHttpRequest()
                    req.open('GET', src, true)
                    req.responseType = "blob"
                    req.onload = () => {
                        createImageBitmap(req.response).then(img => {
                            console.log(img)
                            resolve(img)
                        }).catch(e => {
                            reject(e)
                        })
                    }
                    req.onerror = (e) => reject(e)
                    req.send()
                }
            })
        }
    }

    Platform.canvas = Creator.canvas()
    Platform.conicGradientSupport = !!Platform.canvas.context.createConicGradient
}

Platform.name = 'web'
Platform.isWorker = true
Platform.requestRender = function (render: IFunction): void { requestAnimationFrame(render) }
Platform.devicePixelRatio = 1
Platform.realtimeLayout = true

const { userAgent } = navigator

if (userAgent.indexOf("Firefox") > -1) {
    Platform.conicGradientRotate90 = true
    Platform.intWheelDeltaY = true
} else if (userAgent.indexOf("Safari") > -1 && userAgent.indexOf("Chrome") === -1) {
    Platform.fullImageShadow = true
}

if (userAgent.indexOf('Windows') > -1) {
    Platform.os = 'Windows'
    Platform.intWheelDeltaY = true
} else if (userAgent.indexOf('Mac') > -1) {
    Platform.os = 'Mac'
} else if (userAgent.indexOf('Linux') > -1) {
    Platform.os = 'Linux'
}