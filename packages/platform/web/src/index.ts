export * from '@leafer/core'
export * from '@leafer/partner'

export * from '@leafer/canvas-web'
export * from '@leafer/image-web'
export * from '@leafer/interaction-web'

import { ICreator, IFunction, IExportImageType, IExportFileType, IObject, ICanvasType } from '@leafer/interface'
import { Platform, Creator, FileHelper } from '@leafer/core'

import { LeaferCanvas } from '@leafer/canvas-web'
import { LeaferImage } from '@leafer/image-web'
import { Interaction } from '@leafer/interaction-web'


const { mineType, fileType } = FileHelper


Object.assign(Creator, {
    canvas: (options?, manager?) => new LeaferCanvas(options, manager),
    image: (options) => new LeaferImage(options),
    hitCanvas: (options?, manager?) => new LeaferCanvas(options, manager),

    interaction: (target, canvas, selector, options?) => new Interaction(target, canvas, selector, options),
} as ICreator)


export function useCanvas(_canvasType: ICanvasType, _power?: IObject): void {
    Platform.origin = {
        createCanvas(width: number, height: number): HTMLCanvasElement {
            const canvas = document.createElement('canvas')
            canvas.width = width
            canvas.height = height
            return canvas
        },
        canvasToDataURL: (canvas: HTMLCanvasElement, type?: IExportImageType, quality?: number) => canvas.toDataURL(mineType(type), quality),
        canvasToBolb: (canvas: HTMLCanvasElement, type?: IExportFileType, quality?: number) => new Promise((resolve) => canvas.toBlob(resolve, mineType(type), quality)),
        canvasSaveAs: (canvas: HTMLCanvasElement, filename: string, quality?: any) => {
            return new Promise((resolve) => {
                let el = document.createElement('a')
                el.href = canvas.toDataURL(mineType(fileType(filename)), quality)
                el.download = filename
                document.body.appendChild(el)
                el.click()
                document.body.removeChild(el)
                resolve()
            })
        },
        loadImage(src: any): Promise<HTMLImageElement> {
            return new Promise((resolve, reject) => {
                const img = new Image()
                img.setAttribute('crossOrigin', 'anonymous')
                img.crossOrigin = 'anonymous'
                img.onload = () => { resolve(img) }
                img.onerror = (e) => { reject(e) }
                if (!src.startsWith('data:') && Platform.image.suffix) src += (src.includes("?") ? "&" : "?") + Platform.image.suffix
                img.src = src
            })
        }
    }

    Platform.event = {
        stopDefault(origin: Event): void { origin.preventDefault() },
        stopNow(origin: Event): void { origin.stopImmediatePropagation() },
        stop(origin: Event): void { origin.stopPropagation() }
    }

    Platform.canvas = Creator.canvas()
    Platform.conicGradientSupport = !!Platform.canvas.context.createConicGradient
}

Platform.name = 'web'
Platform.isMobile = 'ontouchstart' in window
Platform.requestRender = function (render: IFunction): void { window.requestAnimationFrame(render) }
Platform.devicePixelRatio = Math.max(1, devicePixelRatio)


// same as worker

const { userAgent } = navigator

if (userAgent.indexOf("Firefox") > -1) {
    Platform.conicGradientRotate90 = true
    Platform.intWheelDeltaY = true
    Platform.syncDomFont = true
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