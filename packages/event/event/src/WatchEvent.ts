import { IWatchEvent, IWatchEventData } from '@leafer/interface'
import { Event } from './Event'
import { registerEvent } from '@leafer/decorator'


@registerEvent()
export class WatchEvent extends Event implements IWatchEvent {

    static REQUEST = 'watch.request'
    static DATA = 'watch.data'

    readonly data: IWatchEventData

    constructor(type: string, data?: IWatchEventData) {
        super(type)
        this.data = data
    }

}