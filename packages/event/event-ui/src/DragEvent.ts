import { IDragEvent } from '@leafer/interface'
import { PointerEvent } from './PointerEvent'
import { registerEvent } from '@leafer/decorator'


@registerEvent()
export class DragEvent extends PointerEvent implements IDragEvent {

    static DRAG = 'drag'

    static START = 'drag.start'
    static END = 'drag.end'

    readonly moveX: number
    readonly moveY: number
    readonly totalX: number
    readonly totalY: number

}