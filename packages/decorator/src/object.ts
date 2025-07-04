import { IObject, IValue } from '@leafer/interface'
import { isUndefined } from '@leafer/data'

export function defineKey<T>(target: T, key: string, descriptor: IObject & ThisType<T>, noConfigurable?: boolean): void {
    if (!noConfigurable) descriptor.configurable = descriptor.enumerable = true
    Object.defineProperty(target, key, descriptor)
}

export function getDescriptor(object: IObject, name: string) {
    return Object.getOwnPropertyDescriptor(object, name)
}

export function createDescriptor(key: string, defaultValue?: IValue) {
    const privateKey = '_' + key
    return {
        get() { const v = (this as IObject)[privateKey]; return isUndefined(v) ? defaultValue : v },
        set(value: IValue) { (this as IObject)[privateKey] = value }
    }
}

export function getNames(object: IObject): string[] {
    return Object.getOwnPropertyNames(object)
}

