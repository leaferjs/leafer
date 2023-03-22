import { IMoveEvent } from '@leafer/interface'
import { registerUIEvent } from '@leafer/decorator'

import { DragEvent } from './DragEvent'

@registerUIEvent()
export class MoveEvent extends DragEvent implements IMoveEvent {

    static MOVE = 'move'
    static START = 'move.start'
    static END = 'move.end'

}