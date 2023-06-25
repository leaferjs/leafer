import { IDropEvent, ILeaf, ILeafList, IObject } from '@leafer/interface'
import { LeafList } from '@leafer/list'
import { registerUIEvent } from '@leafer/decorator'

import { PointerEvent } from './PointerEvent'


@registerUIEvent()
export class DropEvent extends PointerEvent implements IDropEvent {

    static DROP = 'drop'

    readonly list: ILeafList
    readonly data: IObject

    static dragList: ILeafList
    static dragData: IObject

    static setList(data: ILeaf | ILeaf[] | ILeafList): void {
        DropEvent.dragList = data instanceof LeafList ? data : new LeafList(data as ILeaf[])
    }

    static setData(data: IObject): void {
        this.dragData = data
    }

}