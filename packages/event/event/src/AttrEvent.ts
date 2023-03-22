import { IAttrEvent, IEventTarget } from '@leafer/interface'

import { Event } from './Event'


export class AttrEvent extends Event implements IAttrEvent {

    static CHANGE = 'attr.change'

    readonly attrName: string
    readonly oldValue: unknown
    readonly newValue: unknown

    constructor(type: string, target: IEventTarget, attrName: string, oldValue: unknown, newValue: unknown) {
        super(type, target)
        this.attrName = attrName
        this.oldValue = oldValue
        this.newValue = newValue
    }

}