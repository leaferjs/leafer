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

export interface IEventParamsMap {
    [name: string]: IEventListener | [IEventListener, IEventOption]
}

export type IEventParams = any[]

export interface IEventListenerId {
    type: string | string[] | IEventParams[]
    current: ILeaf
    listener?: IEventListener
    options?: IEventOption
}

export type InnerId = number

export interface IEventer extends ILeafEventer {
    readonly innerId: InnerId
    __captureMap?: IEventListenerMap
    __bubbleMap?: IEventListenerMap
    syncEventer?: IEventer
    event?: IEventParamsMap

    on(type: string | string[] | IEventParams[] | IEventParamsMap, listener?: IEventListener, options?: IEventOption): void
    off(type?: string | string[], listener?: IEventListener, options?: IEventOption): void
    on_(type: string | string[] | IEventParams[], listener?: IEventListener, bind?: IObject, options?: IEventOption): IEventListenerId
    off_(id: IEventListenerId | IEventListenerId[]): void
    once(type: string | string[] | IEventParams[], listener?: IEventListener, captureOrBind?: boolean | IObject, capture?: boolean): void
    emit(type: string, event?: IEvent | IObject, capture?: boolean): void
    emitEvent(event?: IEvent, capture?: boolean): void
    hasEvent(type: string, capture?: boolean): boolean

    destroy(): void
}