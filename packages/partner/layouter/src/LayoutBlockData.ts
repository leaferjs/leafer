import { IBounds, ILayoutBlockData, ILeafList, ILeaf } from '@leafer/interface'
import { Bounds, LeafBoundsHelper, LeafList, isArray } from '@leafer/core'


const { worldBounds } = LeafBoundsHelper

export class LayoutBlockData implements ILayoutBlockData {

    public updatedList: ILeafList
    public updatedBounds: IBounds = new Bounds()

    public beforeBounds: IBounds = new Bounds()
    public afterBounds: IBounds = new Bounds()

    constructor(list: ILeafList | ILeaf[]) {
        if (isArray(list)) list = new LeafList(list)
        this.updatedList = list
    }

    public setBefore(): void {
        this.beforeBounds.setListWithFn(this.updatedList.list, worldBounds)
    }

    public setAfter(): void {
        this.afterBounds.setListWithFn(this.updatedList.list, worldBounds)
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