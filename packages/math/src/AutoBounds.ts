import { IAutoBounds, IAutoBoundsData, IBounds, ISizeData } from '@leafer/interface'
import { Bounds } from './Bounds'


export class AutoBounds implements IAutoBounds {

    public top: number
    public right: number
    public bottom: number
    public left: number

    public width: number
    public height: number

    constructor(top?: number | IAutoBoundsData, right?: number, bottom?: number, left?: number, width?: number, height?: number) {
        typeof top === 'object' ? this.copy(top) : this.set(top, right, bottom, left, width, height)
    }

    set(top = 0, right = 0, bottom = 0, left = 0, width = 0, height = 0): void {
        this.top = top
        this.right = right
        this.bottom = bottom
        this.left = left
        this.width = width
        this.height = height
    }

    copy(autoSize: IAutoBoundsData): void {
        const { top, right, bottom, left, width, height } = autoSize
        this.set(top, right, bottom, left, width, height)
    }

    getBoundsFrom(parent: ISizeData): IBounds {
        const { top, right, bottom, left, width, height } = this
        return new Bounds(left, top, width ? width : parent.width - left - right, height ? height : parent.height - top - bottom)
    }

}