import { ILayoutEvent, ILayoutBlockData } from '@leafer/interface'

import { Event } from './Event'


export class LayoutEvent extends Event implements ILayoutEvent {

    static REQUEST = 'layout.request'

    static START = 'layout.start'

    static BEFORE_ONCE = 'layout.before_once'
    static ONCE = 'layout.once'
    static AFTER_ONCE = 'layout.after_once'

    static AGAIN = 'layout.again'

    static LAYOUT = 'layout'
    static END = 'layout.end'

    readonly data: ILayoutBlockData[]

    constructor(type: string, data?: ILayoutBlockData[]) {
        super(type)
        if (data) this.data = data
    }

}