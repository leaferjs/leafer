import { ILeaf, INumberMap, IResizeEvent, IScreenSizeData } from '@leafer/interface'

import { Event } from './Event'


export class ResizeEvent extends Event implements IResizeEvent {

    static RESIZE: string = 'resize'

    static resizingKeys: INumberMap // resize编辑中的元素 LeafList 键表

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
        if (typeof size === 'object') {
            super(ResizeEvent.RESIZE)
            Object.assign(this, size)
        } else {
            super(size)
        }
        this.old = oldSize
    }

    static isResizing(leaf: ILeaf): boolean {
        return this.resizingKeys && this.resizingKeys[leaf.innerId] !== undefined
    }

}