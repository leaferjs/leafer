import { ILeaferCanvas, IScreenSizeData, ICanvasManager } from '@leafer/interface'
import { Creator } from '@leafer/platform'

export class CanvasManager implements ICanvasManager {

    public list: ILeaferCanvas[] = []

    public add(canvas: ILeaferCanvas): void {
        canvas.manager = this
        this.list.push(canvas)
    }

    public get(size: IScreenSizeData): ILeaferCanvas {
        let old: ILeaferCanvas
        const { list } = this
        for (let i = 0, len = list.length; i < len; i++) {
            old = list[i]
            if (old.recycled && old.isSameSize(size)) {
                old.recycled = false
                old.manager || (old.manager = this)
                return old
            }
        }

        const canvas = Creator.canvas(size)
        this.add(canvas)
        return canvas
    }

    public recycle(old: ILeaferCanvas): void {
        if (!old.recycled) {
            old.clear()
            old.recycled = true
        }
    }

    public clearRecycled(): void {
        let canvas: ILeaferCanvas
        const filter: ILeaferCanvas[] = []
        for (let i = 0, len = this.list.length; i < len; i++) {
            canvas = this.list[i]
            canvas.recycled ? canvas.destroy() : filter.push(canvas)
        }
        this.list = filter
    }

    public clear(): void {
        this.list.forEach(item => { item.destroy() })
        this.list.length = 0
    }

    public destory(): void {
        this.clear()
    }

}