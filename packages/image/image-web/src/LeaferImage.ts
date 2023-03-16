import { ILeaferImage, ILeaferImageConfig } from "@leafer/interface"

export class LeaferImage implements ILeaferImage {

    options: ILeaferImageConfig

    constructor(_options: ILeaferImageConfig) {
        this.options = _options
        this.load()
    }

    load(): Promise<HTMLImageElement | HTMLCanvasElement> {
        return new Promise((resolve, reject) => {
            let src: string = this.options.url
            let img = new Image()
            img.setAttribute('crossOrigin', 'anonymous')
            img.crossOrigin = 'anonymous'
            img.onload = () => resolve(img)
            img.onerror = (e) => { console.error(e, this), reject(new Error('load Image error')) }
            img.src = src.includes("?") ? src + "&xhr" : src + "?xhr" // 需要带上xhr区分image标签的缓存，否则导致浏览器跨域问题
        })
    }

    public destory(): void {

    }

}