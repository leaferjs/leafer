import { IObject } from '@leafer/interface'
import { EventCreator, UICreator } from '@leafer/platform'

export function registerUI() { return (target: IObject) => registerUI__(target) }
export function registerUI__(target: IObject) {
    UICreator.register(target)
}

export function registerEvent() { return (target: IObject) => registerEvent__(target) }
export function registerEvent__(target: IObject) {
    EventCreator.register(target)
}