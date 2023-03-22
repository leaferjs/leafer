import { IRenderEvent } from '@leafer/interface'

import { Event } from './Event'


export class RenderEvent extends Event implements IRenderEvent {

    static REQUEST = 'render.request'

    static START = 'render.start'

    static BEFORE_ONCE = 'render.before_once'
    static ONCE = 'render.once'
    static AFTER_ONCE = 'render.after_once'

    static AGAIN = 'render.again'

    static RENDER = 'render'
    static END = 'render.end'

}