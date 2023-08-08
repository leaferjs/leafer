import { ILeaferImage, ILeaferImageConfig, IFunction, IObject } from '@leafer/interface'
import { Platform } from '@leafer/platform'


export class LeaferImageBase implements ILeaferImage {

    public view: any

    public width: number
    public height: number

    public ready: boolean
    public error: IObject

    public options: ILeaferImageConfig

    constructor(_options: ILeaferImageConfig) {
        this.options = _options
    }

    public async load(onSuccess: IFunction, onError: IFunction): Promise<void> {
        return Platform.origin.loadImage(this.options.url).then((img) => {
            this.ready = true
            this.width = img.naturalWidth || img.width
            this.height = img.naturalHeight || img.height
            this.view = img
            if (onSuccess) onSuccess(this)
        }).catch((e) => {
            this.error = e
            if (onError) onError(e)
        })
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
        this.view = null
        this.options = null
    }

}