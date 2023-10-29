import { IEventListener, IEventListenerOptions, IEventListenerMap, IEventListenerItem, IEventListenerId, IEvent, IObject, IEventTarget, ILeafEventerModule } from '@leafer/interface'
import { EventCreator } from '@leafer/platform'

const empty = {}

export const LeafEventer: ILeafEventerModule = {

    on(type: string | string[], listener: IEventListener, options?: IEventListenerOptions | boolean): void {
        let capture: boolean, once: boolean
        if (options) {
            if (typeof options === 'boolean') {
                capture = options
            } else {
                capture = options.capture
                once = options.once
            }
        }

        let events: IEventListenerItem[]
        const map = __getListenerMap(this, capture, true)
        const typeList = typeof type === 'string' ? type.split(' ') : type
        const item = once ? { listener, once } : { listener }

        typeList.forEach(type => {
            if (type) {
                events = map[type]
                if (events) {
                    if (events.findIndex(item => item.listener === listener) === -1) events.push(item)
                } else {
                    map[type] = [item]
                }
            }
        })
    },

    off(type: string | string[], listener: IEventListener, options?: IEventListenerOptions | boolean): void {
        let capture: boolean
        if (options) capture = typeof options === 'boolean' ? options : options.capture

        let events: IEventListenerItem[], index: number
        const map = __getListenerMap(this, capture)
        const typeList = typeof type === 'string' ? type.split(' ') : type

        typeList.forEach(type => {
            if (type) {
                events = map[type]
                if (events) {
                    index = events.findIndex(item => item.listener === listener)
                    if (index > -1) events.splice(index, 1)
                    if (!events.length) delete map[type]
                }
            }
        })
    },

    on_(type: string | string[], listener: IEventListener, bind?: IObject, options?: IEventListenerOptions | boolean): IEventListenerId {
        if (bind) listener = listener.bind(bind)
        this.on(type, listener, options)
        return { type, current: this, listener, options }
    },

    off_(id: IEventListenerId | IEventListenerId[]): void {
        if (!id) return
        const list = id instanceof Array ? id : [id]
        list.forEach(item => item.current.off(item.type, item.listener, item.options))
        list.length = 0
    },

    once(type: string | string[], listener: IEventListener, capture?: boolean): void {
        this.on(type, listener, { once: true, capture })
    },

    emit(type: string, event?: IEvent | IObject, capture?: boolean): void {
        if (!event && EventCreator.has(type)) event = EventCreator.get(type, { type, target: this, current: this } as IEvent)

        const map = __getListenerMap(this, capture)
        const list = map[type]
        if (list) {
            let item: IEventListenerItem
            for (let i = 0, len = list.length; i < len; i++) {
                item = list[i]
                item.listener(event)
                if (item.once) {
                    this.off(type, item.listener, capture)
                    i--, len--
                }
                if (event && (event as IEvent).isStopNow) break
            }
        }
    },

    emitEvent(event: IEvent, capture?: boolean): void {
        event.current = this
        this.emit(event.type, event, capture)
    },

    hasEvent(type: string, capture?: boolean): boolean {
        const { __bubbleMap: b, __captureMap: c } = this
        if (capture === undefined) {
            return !!((c && c[type]) || (b && b[type]))
        } else {
            return !!(capture ? (c && c[type]) : (b && b[type]))
        }
    },

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