import { IMoveEvent } from '@leafer/interface'
import { registerEvent } from '@leafer/decorator'

import { DragEvent } from './DragEvent'

@registerEvent()
export class MoveEvent extends DragEvent implements IMoveEvent {

    static MOVE = 'move'
    static START = 'move.start'
    static END = 'move.end'

}