import { IBounds, ILayoutBlockData, ILeafList, ILeaf } from '@leafer/interface'
import { Bounds, BoundsHelper, LeafBoundsHelper, LeafList } from '@leafer/core'


const { worldBounds } = LeafBoundsHelper
const { setByListWithHandle } = BoundsHelper

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
        setByListWithHandle(this.beforeBounds, this.updatedList.list, worldBounds)
    }

    public setAfter(): void {
        setByListWithHandle(this.afterBounds, this.updatedList.list, worldBounds)
        this.updatedBounds.setByList([this.beforeBounds, this.afterBounds])
    }

    public merge(data: ILayoutBlockData): void {
        this.updatedList.pushList(data.updatedList.list)
        this.beforeBounds.add(data.beforeBounds)
        this.afterBounds.add(data.afterBounds)
        this.updatedBounds.add(data.updatedBounds)
    }

    public destroy(): void {
        this.updatedList = null
    }

}