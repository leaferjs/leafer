import { IEventListener, IEventListenerMap, IEventListenerItem, IEventListenerId, IEvent, IObject, IEventTarget, ILeafEventerModule, IEventOption } from '@leafer/interface'
import { EventCreator } from '@leafer/platform'

const empty = {}

export const LeafEventer: ILeafEventerModule = {

    on(type: string | string[], listener: IEventListener, options?: IEventOption): void {
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

    off(type?: string | string[], listener?: IEventListener, options?: IEventOption): void {
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

    },

    on_(type: string | string[], listener: IEventListener, bind?: IObject, options?: IEventOption): IEventListenerId {
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

        this.syncEventer && this.syncEventer.emitEvent(event, capture)
    },

    emitEvent(event: IEvent, capture?: boolean): void {
        event.current = this
        this.emit(event.type, event, capture)
    },

    hasEvent(type: string, capture?: boolean): boolean {
        if (this.syncEventer && this.syncEventer.hasEvent(type, capture)) return true

        const { __bubbleMap: b, __captureMap: c } = this
        const hasB = b && b[type], hasC = c && c[type]
        return !!(capture === undefined ? (hasB || hasC) : (capture ? hasC : hasB))
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