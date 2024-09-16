import { ILeafEventer } from '../display/module/ILeafEventer'
import { ILeaf } from '../display/ILeaf'
import { IFunction } from '../function/IFunction'
import { IEvent } from './IEvent'
import { IObject } from '../data/IData'


export type IEventListener = IFunction

export interface IEventListenerOptions {
    capture?: boolean
    once?: boolean
}

export type IEventOption = IEventListenerOptions | boolean | 'once'

export interface IEventListenerItem extends IEventListenerOptions {
    listener: IEventListener
}

export interface IEventListenerMap {
    [name: string]: IEventListenerItem[]
}

export interface IEventMap {
    [name: string]: IEventListener | [IEventListener, IEventOption]
}

export interface IEventListenerId {
    type: string | string[]
    current: ILeaf
    listener: IEventListener
    options?: IEventOption
}

export type InnerId = number

export interface IEventer extends ILeafEventer {
    readonly innerId: InnerId
    __captureMap?: IEventListenerMap
    __bubbleMap?: IEventListenerMap
    syncEventer?: IEventer

    on(type: string | string[], listener: IEventListener, options?: IEventOption): void
    off(type?: string | string[], listener?: IEventListener, options?: IEventOption): void
    on_(type: string | string[], listener: IEventListener, bind?: IObject, options?: IEventOption): IEventListenerId
    off_(id: IEventListenerId | IEventListenerId[]): void
    once(type: string | string[], listener: IEventListener): void
    emit(type: string, event?: IEvent | IObject, capture?: boolean): void
    emitEvent(event?: IEvent, capture?: boolean): void
    hasEvent(type: string, capture?: boolean): boolean

    destroy?(): void
}