import { IEventListener, IEventListenerMap, IEventListenerItem, IEventListenerId, IEvent, IObject, IEventTarget, IEventOption, IEventer, IEventParamsMap, InnerId, IEventParams, IFunction } from '@leafer/interface'
import { EventCreator } from '@leafer/platform'
import { isArray } from '@leafer/data'

import { BoundsEvent, boundsEventMap } from './BoundsEvent'


const empty = {}


export class Eventer implements IEventer {

    public readonly innerId: InnerId

    public __captureMap?: IEventListenerMap

    public __bubbleMap?: IEventListenerMap

    public __hasLocalEvent?: boolean
    public __hasWorldEvent?: boolean

    public syncEventer?: IEventer

    public set event(map: IEventParamsMap) { this.on(map) }


    public on(type: string | string[] | IEventParams[] | IEventParamsMap, listener?: IEventListener, options?: IEventOption): void {

        if (!listener) {
            let event: IFunction | [IFunction, IEventOption]
            if (isArray(type)) (type as IEventParams[]).forEach(item => this.on(item[0], item[1], item[2]))
            else for (let key in type as IEventParamsMap) isArray(event = (type as IEventParamsMap)[key]) ? this.on(key, event[0], event[1]) : this.on(key, event)
            return
        }

        let capture: boolean, once: boolean
        if (options) {
            if (options === 'once') {
                once = true
            } else if (typeof options === 'boolean') {
                capture = options
            } else {
                capture = options.capture
                once = options.once
            }
        }

        let events: IEventListenerItem[]
        const map = __getListenerMap(this, capture, true)
        const typeList = typeof type === 'string' ? type.split(' ') : type as string[]
        const item = once ? { listener, once } : { listener }

        typeList.forEach(type => {
            if (type) {
                events = map[type]
                if (events) {
                    if (events.findIndex(item => item.listener === listener) === -1) events.push(item)
                } else {
                    map[type] = [item]
                }

                if (boundsEventMap[type]) BoundsEvent.checkHas(this, type, 'on')
            }
        })
    }

    public off(type?: string | string[], listener?: IEventListener, options?: IEventOption): void {
        if (type) {

            const typeList = typeof type === 'string' ? type.split(' ') : type

            if (listener) {

                let capture: boolean
                if (options) capture = typeof options === 'boolean' ? options : (options === 'once' ? false : options.capture)

                let events: IEventListenerItem[], index: number
                const map = __getListenerMap(this, capture)

                typeList.forEach(type => {
                    if (type) {
                        events = map[type]
                        if (events) {
                            index = events.findIndex(item => item.listener === listener)
                            if (index > -1) events.splice(index, 1)
                            if (!events.length) delete map[type]
                            if (boundsEventMap[type]) BoundsEvent.checkHas(this, type, 'off')
                        }
                    }
                })

            } else {

                // off type
                const { __bubbleMap: b, __captureMap: c } = this
                typeList.forEach(type => {
                    if (b) delete b[type]
                    if (c) delete c[type]
                })

            }

        } else {

            this.__bubbleMap = this.__captureMap = undefined  // off all

        }

    }

    public on_(type: string | string[] | IEventParams[], listener?: IEventListener, bind?: IObject, options?: IEventOption): IEventListenerId {
        if (!listener) isArray(type) && (type as IEventParams[]).forEach(item => this.on(item[0], item[2] ? item[1] = item[1].bind(item[2]) : item[1], item[3]))
        else this.on(type, bind ? listener = listener.bind(bind) : listener, options)
        return { type, current: this as any, listener, options }
    }

    public off_(id: IEventListenerId | IEventListenerId[]): void {
        if (!id) return
        const list = isArray(id) ? id : [id]
        list.forEach(item => {
            if (!item.listener) isArray(item.type) && (item.type as IEventParams[]).forEach(v => item.current.off(v[0], v[1], v[3]))
            else item.current.off(item.type as string | string[], item.listener, item.options)
        })
        list.length = 0
    }

    public once(type: string | string[] | IEventParams[], listener?: IEventListener, captureOrBind?: boolean | IObject, capture?: boolean): void {
        if (!listener) return isArray(type) && (type as IEventParams[]).forEach(item => this.once(item[0], item[1], item[2], item[3]))
        if (typeof captureOrBind === 'object') listener = listener.bind(captureOrBind)
        else capture = captureOrBind
        this.on(type, listener, { once: true, capture })
    }

    public emit(type: string, event?: IEvent | IObject, capture?: boolean): void {
        if (!event && EventCreator.has(type)) event = EventCreator.get(type, { type, target: this, current: this } as IEvent)

        const map = __getListenerMap(this, capture)
        const list = map[type]
        if (list) {
            let item: IEventListenerItem
            for (let i = 0, len = list.length; i < len; i++) {
                if (item = list[i]) { // 防止 list 变化造成的空值
                    item.listener(event)
                    if (item.once) {
                        this.off(type, item.listener, capture)
                        i--, len--
                    }
                    if (event && event.isStopNow) break
                }
            }
        }

        this.syncEventer && this.syncEventer.emitEvent(event, capture)
    }

    public emitEvent(event: IEvent, capture?: boolean): void {
        event.current = this
        this.emit(event.type, event, capture)
    }

    public hasEvent(type: string, capture?: boolean): boolean {
        if (this.syncEventer && this.syncEventer.hasEvent(type, capture)) return true

        const { __bubbleMap: b, __captureMap: c } = this
        const hasB = b && b[type], hasC = c && c[type]
        return !!(capture === undefined ? (hasB || hasC) : (capture ? hasC : hasB))
    }

    public destroy(): void {
        this.__captureMap = this.__bubbleMap = this.syncEventer = null
    }
}


function __getListenerMap(eventer: IEventTarget, capture?: boolean, create?: boolean): IEventListenerMap {
    if (capture) {

        const { __captureMap: c } = eventer
        if (c) {
            return c
        } else {
            return create ? eventer.__captureMap = {} : empty
        }

    } else {

        const { __bubbleMap: b } = eventer
        if (b) {
            return b
        } else {
            return create ? eventer.__bubbleMap = {} : empty
        }

    }
}