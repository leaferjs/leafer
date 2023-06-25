import { IPropertyEvent, IEventTarget } from '@leafer/interface'

import { Event } from './Event'


export class PropertyEvent extends Event implements IPropertyEvent {

    static CHANGE = 'property.change'

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