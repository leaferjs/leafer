import { ILeafDataProxyModule } from '@leafer/interface'
import { PropertyEvent } from '@leafer/event'


export const LeafDataProxy: ILeafDataProxyModule = {

    __setAttr(name: string, newValue: unknown): void {
        if (this.leafer && this.leafer.ready) {
            this.__[name] = newValue
            const { CHANGE } = PropertyEvent
            const event = new PropertyEvent(CHANGE, this, name, this.__.__get(name), newValue)
            if (this.hasEvent(CHANGE) && !this.isLeafer) this.emitEvent(event)
            this.leafer.emitEvent(event)
        } else {
            this.__[name] = newValue
        }
    },

    __getAttr(name: string): unknown {
        return this.__.__get(name)
    }

}