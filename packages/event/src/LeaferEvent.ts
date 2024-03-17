import { ILeaferEvent } from '@leafer/interface'

import { Event } from './Event'


export class LeaferEvent extends Event implements ILeaferEvent {

    static START = 'leafer.start'

    static BEFORE_READY = 'leafer.before_ready'
    static READY = 'leafer.ready'
    static AFTER_READY = 'leafer.after_ready'

    static VIEW_READY = 'leafer.view_ready'

    static VIEW_COMPLETED = 'leafer.view_completed'

    static STOP = 'leafer.stop'
    static RESTART = 'leafer.restart'

    static END = 'leafer.end'

}