import { IDragEvent } from '@leafer/interface'
import { registerEvent } from '@leafer/decorator'

import { PointerEvent } from './PointerEvent'


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