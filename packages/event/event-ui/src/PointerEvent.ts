import { IPointerEvent, PointerType } from '@leafer/interface'
import { UIEvent } from './UIEvent'
import { registerEvent } from '@leafer/decorator'


@registerEvent()
export class PointerEvent extends UIEvent implements IPointerEvent {

    static POINTER = 'pointer'

    static BEFORE_DOWN = 'pointer.before_down'
    static BEFORE_MOVE = 'pointer.before_move'
    static BEFORE_UP = 'pointer.before_up'

    static DOWN = 'pointer.down'
    static MOVE = 'pointer.move'
    static UP = 'pointer.up'

    static ENTER = 'pointer.enter'
    static LEAVE = 'pointer.leave'

    static TAP = 'tap'
    static CLICK = 'click'
    static DOUBLE_CLICK = 'doubleclick'

    static LONG_PRESS = 'longpress'
    static LONG_TAP = 'longtap'

    public readonly width: number
    public readonly height: number
    public readonly pointerType: PointerType
    public readonly pressure: number
    public readonly tangentialPressure?: number
    public readonly tiltX?: number
    public readonly tiltY?: number
    public readonly twist?: number

}