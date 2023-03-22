import { ILeaferEvent } from '@leafer/interface'

import { Event } from './Event'


export class LeaferEvent extends Event implements ILeaferEvent {

    static READY = 'leafer.ready'

}