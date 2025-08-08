import { IPropertyEvent, IEventTarget, IStringMap } from '@leafer/interface'

import { Event } from './Event'


const SCROLL = 'property.scroll'

export class PropertyEvent extends Event implements IPropertyEvent {

    static CHANGE = 'property.change'
    static LEAFER_CHANGE = 'property.leafer_change'

    static SCROLL = SCROLL

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

// 额外派发的属性事件
export const extraPropertyEventMap: IStringMap = {
    scrollX: SCROLL,
    scrollY: SCROLL
}