import { IRotateEvent } from '@leafer/interface'
import { registerUIEvent } from '@leafer/decorator'

import { UIEvent } from './UIEvent'


@registerUIEvent()
export class RotateEvent extends UIEvent implements IRotateEvent {

    static ROTATE = 'rotate'

    static START = 'rotate.start'
    static END = 'rotate.end'

    readonly rotation: number

}