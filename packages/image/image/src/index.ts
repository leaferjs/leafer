export { LeaferImage } from './LeaferImage'
export { ImageManager } from './ImageManager'

import { IObject, IBoundsData } from '@leafer/interface'
import { Platform } from '@leafer/platform'


const { floor, max } = Math

export function resizeImage(image: any, width: number, height: number, xGap?: number, yGap?: number, _clip?: IBoundsData, smooth?: boolean, opacity?: number, _filters?: IObject): any {
    const canvas = Platform.origin.createCanvas(max(floor(width + (xGap || 0)), 1), max(floor(height + (yGap || 0)), 1),)
    const ctx = canvas.getContext('2d')
    if (opacity) ctx.globalAlpha = opacity
    ctx.imageSmoothingEnabled = smooth === false ? false : true // 平滑绘制
    ctx.drawImage(image, 0, 0, width, height)
    return canvas
}