import { IBounds, IRenderEvent, IRenderOptions } from '@leafer/interface'

import { Event } from './Event'


export class RenderEvent extends Event implements IRenderEvent {

    static REQUEST = 'render.request'

    static CHILD_START = 'render.child_start' // app 专用
    static START = 'render.start'

    static BEFORE = 'render.before'
    static RENDER = 'render'
    static AFTER = 'render.after'

    static AGAIN = 'render.again'

    static END = 'render.end'

    static NEXT = 'render.next'

    readonly renderBounds: IBounds
    readonly renderOptions: IRenderOptions
    readonly times: number

    constructor(type: string, times?: number, bounds?: IBounds, options?: IRenderOptions) {
        super(type)
        if (times) this.times = times
        if (bounds) {
            this.renderBounds = bounds
            this.renderOptions = options
        }
    }

}