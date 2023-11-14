import { IBounds, ILayoutBlockData, ILeafList, ILeaf } from '@leafer/interface'
import { Bounds, BoundsHelper, LeafBoundsHelper, LeafList } from '@leafer/core'


const { worldBounds } = LeafBoundsHelper
const { setListWithFn } = BoundsHelper
const bigBounds = { x: 0, y: 0, width: 100000, height: 100000 }

export class LayoutBlockData implements ILayoutBlockData {

    public updatedList: ILeafList
    public updatedBounds: IBounds = new Bounds()

    public beforeBounds: IBounds = new Bounds()
    public afterBounds: IBounds = new Bounds()

    constructor(list: ILeafList | ILeaf[]) {
        if (list instanceof Array) list = new LeafList(list)
        this.updatedList = list
    }

    public setBefore(): void {
        setListWithFn(this.beforeBounds, this.updatedList.list, worldBounds)
    }

    public setAfter(): void {
        const { list } = this.updatedList
        if (list.some(leaf => leaf.noBounds)) {
            this.afterBounds.set(bigBounds)
        } else {
            setListWithFn(this.afterBounds, list, worldBounds)
        }

        this.updatedBounds.setList([this.beforeBounds, this.afterBounds])
    }

    public merge(data: ILayoutBlockData): void {
        this.updatedList.addList(data.updatedList.list)
        this.beforeBounds.add(data.beforeBounds)
        this.afterBounds.add(data.afterBounds)
        this.updatedBounds.add(data.updatedBounds)
    }

    public destroy(): void {
        this.updatedList = null
    }

}