import { UIEvent } from './UIEvent'
import { IKeyEvent } from '@leafer/interface'
import { registerEvent } from '@leafer/decorator'


@registerEvent()
export class KeyEvent extends UIEvent implements IKeyEvent {

    static DOWN = 'key.down'
    static PRESS = 'key.press'
    static UP = 'key.up'

}