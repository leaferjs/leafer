import { IAnimateEvent } from '@leafer/interface'

import { Event } from './Event'


export class AnimateEvent extends Event implements IAnimateEvent {

    static FRAME = 'animate.frame'

}