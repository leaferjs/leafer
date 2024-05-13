import { ILeaf } from '../ILeaf'
import { IEventListener, IEventListenerId, IEventListenerOptions } from '../../event/IEventer'
import { } from '@leafer/interface'
import { IEvent } from '../../event/IEvent'
import { IObject } from '../../data/IData'

export type ILeafEventerModule = ILeafEventer & ThisType<ILeaf>

export interface ILeafEventer {
    on?(type: string | string[], listener: IEventListener, options?: IEventListenerOptions | boolean): void
    off?(type?: string | string[], listener?: IEventListener, options?: IEventListenerOptions | boolean): void
    on_?(type: string | string[], listener: IEventListener, bind?: IObject, options?: IEventListenerOptions | boolean): IEventListenerId
    off_?(id: IEventListenerId | IEventListenerId[]): void
    once?(type: string | string[], listener: IEventListener, capture?: boolean): void
    emit?(type: string, event?: IEvent | IObject, capture?: boolean): void
    emitEvent?(event?: IEvent, capture?: boolean): void
    hasEvent?(type: string, capture?: boolean): boolean
}
