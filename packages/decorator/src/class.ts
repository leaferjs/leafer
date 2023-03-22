import { IObject } from '@leafer/interface'
import { EventCreator, UICreator } from '@leafer/platform'

export function registerUI() {
    return (target: IObject) => {
        UICreator.register(target)
    }
}

export function registerUIEvent() {
    return (target: IObject) => {
        EventCreator.register(target)
    }
}