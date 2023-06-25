import { ILeaferImage, ILeaferImageConfig, IFunction, IObject } from '@leafer/interface'

export class LeaferImage implements ILeaferImage {

    public view: HTMLImageElement

    public width: number
    public height: number

    public ready: boolean

    public options: ILeaferImageConfig

    constructor(_options: ILeaferImageConfig) {
        this.options = _options
    }

    public load(onSuccess: IFunction, onError: IFunction): void {
        let src: string = this.options.url
        const img = this.view = new Image()
        img.setAttribute('crossOrigin', 'anonymous')
        img.crossOrigin = 'anonymous'
        img.onload = () => {
            this.ready = true
            this.width = img.naturalWidth
            this.height = img.naturalHeight
            if (onSuccess) onSuccess(this)
        }
        img.onerror = (e) => { if (onError) onError(e) }
        if (!src.startsWith('data:')) src.includes("?") ? src + "&xhr" : src + "?xhr" // 需要带上xhr区分image标签的缓存，否则导致浏览器跨域问题
        img.src = src
    }

    public getCanvas(width: number, height: number, opacity?: number, _filters?: IObject): HTMLCanvasElement {
        const canvas = document.createElement('canvas')
        width || (width = this.width)
        height || (height = this.height)
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (opacity) ctx.globalAlpha = opacity
        ctx.drawImage(this.view, 0, 0, width, height)
        return canvas
    }

    public destory(): void {
        this.view = null
        this.options = null
    }

}