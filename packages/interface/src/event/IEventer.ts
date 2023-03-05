import { IEvent, IFunction, IObject } from '@leafer/interface'
import { LeafEventer } from '../display/module/ILeafEventer'

export type IEventListener = IFunction

export interface IEventListenerOptions {
    capture?: boolean
    once?: boolean
}

export interface IEventListenerItem extends IEventListenerOptions {
    listener: IEventListener
}

export interface IEventListenerMap {
    [name: string]: IEventListenerItem[]
}

export interface IEventListenerId {
    type: string | string[]
    listener: IEventListener
    options?: IEventListenerOptions | boolean
}

export type InnerId = number

export interface IEventer extends LeafEventer {

    readonly innerId: InnerId
    __captureMap?: IEventListenerMap
    __bubbleMap?: IEventListenerMap

    on(type: string | string[], listener: IEventListener, options?: IEventListenerOptions | boolean): void
    off(type: string | string[], listener: IEventListener, options?: IEventListenerOptions | boolean): void
    on__(type: string | string[], listener: IEventListener, bind?: IObject, options?: IEventListenerOptions | boolean): IEventListenerId
    off__(id: IEventListenerId | IEventListenerId[]): void
    once(type: string | string[], listener: IEventListener): void
    emit(type: string, event?: IEvent | IObject, capture?: boolean): void
    emitEvent(event?: IEvent, capture?: boolean): void
    hasEvent(type: string, capture?: boolean): boolean

    destroy(): void
}