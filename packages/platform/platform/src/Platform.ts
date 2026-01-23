import { IPlatform, IObject, IBoundsData, ICanvasPattern, IMatrixData, ILeaferImagePatternPaint, ISizeData, ICanvasContext2D, IInterlace } from '@leafer/interface'
import { DataHelper } from '@leafer/data'
import { UnitConvertHelper } from '@leafer/math'


const { floor, max } = Math

export const Platform: IPlatform = {
    toURL(text: string, fileType?: 'text' | 'svg'): string {
        let url = encodeURIComponent(text)
        if (fileType === 'text') url = 'data:text/plain;charset=utf-8,' + url
        else if (fileType === 'svg') url = 'data:image/svg+xml,' + url
        return url
    },
    image: {
        hitCanvasSize: 100,
        maxCacheSize: 2560 * 1600,  // 2k
        maxPatternSize: 4096 * 2160, // 4k
        crossOrigin: 'anonymous',
        isLarge(size: ISizeData, scaleX?: number, scaleY?: number, largeSize?: number): boolean {
            return size.width * size.height * (scaleX ? scaleX * scaleY : 1) > (largeSize || image.maxCacheSize)
        },
        isSuperLarge(size: ISizeData, scaleX?: number, scaleY?: number): boolean {
            return image.isLarge(size, scaleX, scaleY, image.maxPatternSize)
        },
        getRealURL(url: string): string {
            const { prefix, suffix } = image
            if (suffix && !url.startsWith('data:') && !url.startsWith('blob:')) url += (url.includes("?") ? "&" : "?") + suffix
            if (prefix && url[0] === '/') url = prefix + url
            return url
        },
        resize(view: any, width: number, height: number, xGap?: number, yGap?: number, clip?: IBoundsData, smooth?: boolean, opacity?: number, _filters?: IObject, interlace?: IInterlace): any {
            const realWidth = max(floor(width + (xGap || 0)), 1), realHeight = max(floor(height + (yGap || 0)), 1)

            let interlaceX: boolean, interlaceY: boolean, interlaceOffset: number
            if (interlace && (interlaceOffset = UnitConvertHelper.number(interlace.offset, (interlaceX = interlace.type === 'x') ? width : height))) interlaceX || (interlaceY = true)

            const canvas = Platform.origin.createCanvas(interlaceY ? realWidth * 2 : realWidth, interlaceX ? realHeight * 2 : realHeight)
            const ctx: ICanvasContext2D = canvas.getContext('2d')
            if (opacity) ctx.globalAlpha = opacity
            ctx.imageSmoothingEnabled = smooth === false ? false : true // 平滑绘制

            if (image.canUse(view)) {
                if (clip) {
                    const scaleX = width / clip.width, scaleY = height / clip.height
                    ctx.setTransform(scaleX, 0, 0, scaleY, -clip.x * scaleX, -clip.y * scaleY)
                    ctx.drawImage(view, 0, 0, view.width, view.height)
                } else ctx.drawImage(view, 0, 0, width, height)

                if (interlaceOffset) {
                    ctx.drawImage(canvas, 0, 0, realWidth, realHeight, interlaceX ? interlaceOffset - realWidth : realWidth, interlaceX ? realHeight : interlaceOffset - realHeight, realWidth, realHeight)
                    ctx.drawImage(canvas, 0, 0, realWidth, realHeight, interlaceX ? interlaceOffset : realWidth, interlaceX ? realHeight : interlaceOffset, realWidth, realHeight)
                }
            }

            return canvas
        },
        canUse(view: any): boolean {
            return view && view.width && !view.__closed // __closed 为内部标记已销毁
        },
        setPatternTransform(pattern: ICanvasPattern, transform?: IMatrixData, paint?: ILeaferImagePatternPaint): void {
            try {
                if (transform && pattern.setTransform) {
                    pattern.setTransform(transform) // maybe error 
                    transform = undefined
                }
            } catch { }
            if (paint) DataHelper.stintSet(paint, 'transform', transform)
        }
    }
}

const { image } = Platform