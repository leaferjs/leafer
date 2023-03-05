import { IResizeEvent, IScreenSizeData } from '@leafer/interface'
import { Event } from './Event'
import { registerEvent } from '@leafer/decorator'


@registerEvent()
export class ResizeEvent extends Event implements IResizeEvent {

    static RESIZE: string = 'resize'

    readonly width: number
    readonly height: number
    readonly pixelRatio: number

    public get bigger(): boolean {
        if (!this.old) return true
        const { width, height } = this.old
        return this.width >= width && this.height >= height
    }

    public get smaller(): boolean {
        return !this.bigger
    }

    public get samePixelRatio(): boolean {
        if (!this.old) return true
        return this.pixelRatio === this.old.pixelRatio
    }

    readonly old: IScreenSizeData

    constructor(size: IScreenSizeData | string, oldSize?: IScreenSizeData) {
        const realSize = typeof size === 'object'
        super(realSize ? ResizeEvent.RESIZE : size)
        if (realSize) Object.assign(this, size)
        this.old = oldSize
    }

}