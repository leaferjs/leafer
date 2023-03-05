import { IRotateEvent } from '@leafer/interface'
import { UIEvent } from './UIEvent'
import { registerEvent } from '@leafer/decorator'


@registerEvent()
export class RotateEvent extends UIEvent implements IRotateEvent {

    static ROTATE = 'rotate'

    static START = 'rotate.start'
    static END = 'rotate.end'

    readonly rotation: number

}