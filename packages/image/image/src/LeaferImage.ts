import { ILeaferImage, ILeaferImageConfig, IFunction, IObject, InnerId } from '@leafer/interface'
import { Platform } from '@leafer/platform'
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

    public get completed() { return this.ready || !!this.error }

    public ready: boolean
    public error: IObject
    public loading: boolean

    public use = 0

    public config: ILeaferImageConfig

    protected waitComplete: IFunction[] = []

    constructor(config: ILeaferImageConfig) {
        this.innerId = create(IMAGE)
        this.config = config || { url: '' }
        this.isSVG = ImageManager.isFormat('svg', config)
    }

    public load(onSuccess: IFunction, onError: IFunction): number {
        if (!this.loading) {
            this.loading = true
            ImageManager.tasker.add(async () => await Platform.origin.loadImage(this.url).then((img) => {
                this.ready = true
                this.width = img.naturalWidth || img.width
                this.height = img.naturalHeight || img.height
                this.view = img
                this.onComplete(true)
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
        const canvas = Platform.origin.createCanvas(width, height)
        const ctx = canvas.getContext('2d')
        if (opacity) ctx.globalAlpha = opacity
        ctx.drawImage(this.view, 0, 0, width, height)
        return canvas
    }

    public destroy(): void {
        this.config = { url: '' }
        this.waitComplete.length = 0
    }

}