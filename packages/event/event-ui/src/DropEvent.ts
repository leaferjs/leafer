import { IDropEvent, ILeaf, ILeafList } from '@leafer/interface'
import { LeafList } from '@leafer/list'
import { registerUIEvent } from '@leafer/decorator'

import { PointerEvent } from './PointerEvent'


@registerUIEvent()
export class DropEvent extends PointerEvent implements IDropEvent {

    static DROP = 'drop'

    static ENTER = 'drop.enter'
    static LEAVE = 'drop.leave'

    readonly list: ILeafList

    static dragList: ILeafList
    static setList(data: ILeaf | ILeaf[] | ILeafList): void {
        DropEvent.dragList = data instanceof LeafList ? data : new LeafList(data as ILeaf[])
    }

}