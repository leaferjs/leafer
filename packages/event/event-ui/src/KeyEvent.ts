import { IKeyEvent } from '@leafer/interface'
import { registerUIEvent } from '@leafer/decorator'

import { UIEvent } from './UIEvent'


@registerUIEvent()
export class KeyEvent extends UIEvent implements IKeyEvent {

    static DOWN = 'key.down'
    static PRESS = 'key.press'
    static UP = 'key.up'

}