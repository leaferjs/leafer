import { ILeaferImage, ILeaferImageConfig, IFunction, IObject, InnerId, IMatrixData, ICanvasPattern, ILeaferImageCacheCanvas, ILeaferImagePatternPaint, ILeaferImageLevel, ISizeData, IImageCrossOrigin } from '@leafer/interface'
import { Platform } from '@leafer/platform'
import { Resource } from '@leafer/file'
import { IncrementId } from '@leafer/math'
import { isUndefined } from '@leafer/data'

import { ImageManager } from './ImageManager'


const { IMAGE, create } = IncrementId

export class LeaferImage implements ILeaferImage {

    public readonly innerId: InnerId
    public get url() { return this.config.url }
    public get crossOrigin(): IImageCrossOrigin { const { crossOrigin } = this.config; return isUndefined(crossOrigin) ? Platform.image.crossOrigin : crossOrigin }

    public view: any

    public width: number
    public height: number

    public isSVG: boolean
    public hasAlphaPixel: boolean // check png / svg / webp

    public get completed() { return this.ready || !!this.error }

    public ready: boolean
    public error: IObject
    public loading: boolean

    public use = 0

    public config: ILeaferImageConfig

    protected waitComplete: IFunction[] = []

    protected cache: ILeaferImageCacheCanvas

    constructor(config: ILeaferImageConfig) {
        this.innerId = create(IMAGE)
        this.config = config || (config = { url: '' })
        if (config.view) {
            const { view } = config
            this.setView(view.config ? view.view : view)
        }

        ImageManager.isFormat('svg', config) && (this.isSVG = true)
        ImageManager.hasAlphaPixel(config) && (this.hasAlphaPixel = true)
    }

    public load(onSuccess?: IFunction, onError?: IFunction, thumbSize?: ISizeData): number {
        if (!this.loading) {
            this.loading = true
            Resource.tasker.add(async () => await Platform.origin.loadImage(this.getLoadUrl(thumbSize), this.crossOrigin, this).then(img => {
                if (thumbSize) this.setThumbView(img)
                this.setView(img)
            }).catch((e) => {
                this.error = e
                this.onComplete(false)
            }))
        }
        this.waitComplete.push(onSuccess, onError)
        return this.waitComplete.length - 2
    }

    public unload(index: number, stopEvent?: boolean): void {
        const l = this.waitComplete
        if (stopEvent) {
            const error = l[index + 1]
            if (error) error({ type: 'stop' })
        }
        l[index] = l[index + 1] = undefined
    }

    protected setView(img: any): void {
        this.ready = true
        if (!this.width) {
            this.width = img.width
            this.height = img.height
            this.view = img
        }
        this.onComplete(true)
    }

    protected onComplete(isSuccess: boolean): void {
        let odd: number
        this.waitComplete.forEach((item, index) => {
            odd = index % 2
            if (item) {
                if (isSuccess) {
                    if (!odd) item(this)
                } else {
                    if (odd) item(this.error)
                }
            }
        })
        this.waitComplete.length = 0
        this.loading = false
    }

    public getFull(_filters?: IObject): any {
        return this.view
    }

    public getCanvas(width: number, height: number, opacity?: number, filters?: IObject, xGap?: number, yGap?: number, smooth?: boolean): any {
        width || (width = this.width)
        height || (height = this.height)

        if (this.cache) { // when use > 1, check cache
            let { params, data } = this.cache
            for (let i in params) { if (params[i] !== arguments[i]) { data = null; break } }
            if (data) return data
        }

        const canvas = Platform.image.resize(this.view, width, height, xGap, yGap, undefined, smooth, opacity, filters)

        this.cache = this.use > 1 ? { data: canvas, params: arguments } : null

        return canvas
    }

    public getPattern(canvas: any, repeat: string | null, transform?: IMatrixData, paint?: ILeaferImagePatternPaint): ICanvasPattern {
        const pattern = Platform.canvas.createPattern(canvas, repeat)
        Platform.image.setPatternTransform(pattern, transform, paint)
        return pattern
    }

    // need rewrite
    public getLoadUrl(_thumbSize?: ISizeData): string { return this.url }
    public setThumbView(_view: number): void { }
    public getThumbSize(): ISizeData { return undefined }

    public getMinLevel(): number { return undefined }
    public getLevelData(_level: number): ILeaferImageLevel { return undefined }
    public clearLevels(_checkUse?: boolean): void { }

    public destroy(): void {
        this.clearLevels()

        const { view } = this
        if (view && view.close) view.close() // 可能为 ImageBitmap
        this.config = { url: '' }
        this.cache = this.view = null
        this.waitComplete.length = 0
    }

}