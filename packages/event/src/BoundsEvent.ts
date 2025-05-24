import { IBoundsEvent, IEventTarget, ILeaf, IObject } from '@leafer/interface'

import { Event } from './Event'


export class BoundsEvent extends Event implements IBoundsEvent {

    static RESIZE = 'bounds.resize'

    static INNER = 'bounds.inner'

    static LOCAL = 'bounds.local'

    static WORLD = 'bounds.world'


    static checkHas(leaf: IEventTarget, type: string, mode: 'on' | 'off') {
        if (mode === 'on') {
            type === WORLD ? leaf.__hasWorldEvent = true : leaf.__hasLocalEvent = true
        } else {
            leaf.__hasLocalEvent = leaf.hasEvent(RESIZE) || leaf.hasEvent(INNER) || leaf.hasEvent(LOCAL)
            leaf.__hasWorldEvent = leaf.hasEvent(WORLD)
        }
    }

    static emitLocal(leaf: ILeaf) {
        if (leaf.leaferIsReady) {
            const { resized } = leaf.__layout
            if (resized !== 'local') {
                leaf.emit(RESIZE, leaf)
                if (resized === 'inner') leaf.emit(INNER, leaf)
            }
            leaf.emit(LOCAL, leaf)
        }
    }

    static emitWorld(leaf: ILeaf) {
        if (leaf.leaferIsReady) leaf.emit(WORLD, this)
    }

}

const { RESIZE, INNER, LOCAL, WORLD } = BoundsEvent


export const boundsEventMap: IObject = {};

[RESIZE, INNER, LOCAL, WORLD].forEach(key => boundsEventMap[key] = 1)