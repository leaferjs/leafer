import { IObject } from '@leafer/interface'

export function defineKey<T>(target: T, key: string, descriptor: IObject & ThisType<T>): void {
    Object.defineProperty(target, key, descriptor)
}

export function getDescriptor(object: IObject, name: string) {
    return Object.getOwnPropertyDescriptor(object, name)
}

export function getNames(object: IObject): string[] {
    return Object.getOwnPropertyNames(object)
}

