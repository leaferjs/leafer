import { ITransformEvent, ITransformEventData } from '@leafer/interface'

import { Event } from './Event'


export class TransformEvent extends Event implements ITransformEvent {

    static START = 'transform.start'
    static CHANGE = 'transform.change'
    static END = 'transform.end'

    static BEFORE_START = 'transform.before_start'
    static BEFORE_CHANGE = 'transform.before_change'
    static BEFORE_END = 'transform.before_end'

    readonly x: number
    readonly y: number
    readonly scaleX: number
    readonly scaleY: number
    readonly rotation: number

    readonly zooming: boolean
    readonly moving: boolean
    readonly rotating: boolean
    readonly changing: boolean

    constructor(type: string, params?: ITransformEventData) {
        super(type)
        if (params) Object.assign(this, params)
    }

}