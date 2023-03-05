import { IMoveEvent } from '@leafer/interface'
import { DragEvent } from './DragEvent'
import { registerEvent } from '@leafer/decorator'


@registerEvent()
export class MoveEvent extends DragEvent implements IMoveEvent {

    static MOVE = 'move'
    static START = 'move.start'
    static END = 'move.end'

}