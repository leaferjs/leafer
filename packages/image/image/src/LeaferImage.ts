import { ILeaferImage, ILeaferImageConfig, IFunction, IObject, InnerId, IMatrixData, ICanvasPattern, ILeaferImageCacheCanvas, ILeaferImagePatternPaint } from '@leafer/interface'
import { Platform } from '@leafer/platform'
import { Resource } from '@leafer/file'
import { IncrementId } from '@leafer/math'

import { ImageManager } from './ImageManager'


const { IMAGE, create } = IncrementId

export class LeaferImage implements ILeaferImage {

    public readonly innerId: InnerId
    public get url() { return this.config.url }

    public view: any

    public width: number
    public height: number

    public isSVG: boolean
    public hasOpacityPixel: boolean // check png / svg / webp

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
        ImageManager.hasOpacityPixel(config) && (this.hasOpacityPixel = true)
    }

    public load(onSuccess?: IFunction, onError?: IFunction): number {
        if (!this.loading) {
            this.loading = true
            Resource.tasker.add(async () => await Platform.origin.loadImage(this.url as string).then(img => this.setView(img)).catch((e) => {
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
        this.width = img.naturalWidth || img.width
        this.height = img.naturalHeight || img.height
        this.view = img
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

    public getCanvas(width: number, height: number, opacity?: number, _filters?: IObject): any {
        width || (width = this.width)
        height || (height = this.height)

        if (this.cache) { // when use > 1, check cache
            let { params, data } = this.cache
            for (let i in params) { if (params[i] !== arguments[i]) { data = null; break } }
            if (data) return data
        }

        const canvas = Platform.origin.createCanvas(width, height)
        const ctx = canvas.getContext('2d')
        if (opacity) ctx.globalAlpha = opacity
        ctx.drawImage(this.view, 0, 0, width, height)

        this.cache = this.use > 1 ? { data: canvas, params: arguments } : null

        return canvas
    }

    public getPattern(canvas: any, repeat: string | null, transform?: IMatrixData, paint?: ILeaferImagePatternPaint): ICanvasPattern {
        const pattern = Platform.canvas.createPattern(canvas, repeat)
        try {
            if (transform && pattern.setTransform) {
                pattern.setTransform(transform) // maybe error 
                transform = null
            }
        } catch { }
        if (paint) paint.transform = transform
        return pattern
    }

    public destroy(): void {
        this.config = { url: '' }
        this.cache = null
        this.waitComplete.length = 0
    }

}