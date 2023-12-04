import { ILayoutEvent, ILayoutBlockData } from '@leafer/interface'

import { Event } from './Event'


export class LayoutEvent extends Event implements ILayoutEvent {

    static CHECK_UPDATE = 'layout.check_update'

    static REQUEST = 'layout.request'

    static START = 'layout.start'

    static BEFORE = 'layout.before'
    static LAYOUT = 'layout'
    static AFTER = 'layout.after'

    static AGAIN = 'layout.again'

    static END = 'layout.end'

    readonly data: ILayoutBlockData[]
    readonly times: number

    constructor(type: string, data?: ILayoutBlockData[], times?: number) {
        super(type)
        if (data) {
            this.data = data
            this.times = times
        }

    }

}