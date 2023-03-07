import { ITransformEvent, ITransformEventData } from '@leafer/interface'
import { registerEvent } from '@leafer/decorator'

import { Event } from './Event'


@registerEvent()
export class TransformEvent extends Event implements ITransformEvent {

    static BEFORE = 'transform.before'
    static CHANGE = 'transform.change'
    static AFTER = 'transform.after'

    static PRE_BEFORE = 'transform.pre_before'
    static PRE_CHANGE = 'transform.pre_change'
    static PRE_AFTER = 'transform.pre_after'

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