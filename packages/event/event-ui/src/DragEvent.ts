import { IDragEvent } from '@leafer/interface'
import { registerUIEvent } from '@leafer/decorator'

import { PointerEvent } from './PointerEvent'


@registerUIEvent()
export class DragEvent extends PointerEvent implements IDragEvent {

    static DRAG = 'drag'

    static START = 'drag.start'
    static END = 'drag.end'

    static OVER = 'drag.over'
    static OUT = 'drag.out'

    static ENTER = 'drag.enter'
    static LEAVE = 'drag.leave'

    readonly moveX: number
    readonly moveY: number
    readonly totalX: number
    readonly totalY: number

}