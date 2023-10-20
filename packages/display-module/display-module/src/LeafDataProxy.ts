import { ILeafDataProxyModule, __Value } from '@leafer/interface'
import { PropertyEvent } from '@leafer/event'


export const LeafDataProxy: ILeafDataProxyModule = {

    __setAttr(name: string, newValue: __Value): void {
        if (this.leafer && this.leafer.created) {
            const oldValue = this.__.__getInput(name)
            if (typeof newValue === 'object' || oldValue !== newValue) {
                this.__[name] = newValue
                if (this.proxyData) this.setProxyAttr(name, newValue)

                const { CHANGE } = PropertyEvent
                const event = new PropertyEvent(CHANGE, this, name, oldValue, newValue)
                if (this.hasEvent(CHANGE) && !this.isLeafer) this.emitEvent(event)
                this.leafer.emitEvent(event)
            }
        } else {
            this.__[name] = newValue
            if (this.proxyData) this.setProxyAttr(name, newValue)
        }
    },

    __getAttr(name: string): __Value {
        if (this.proxyData) return this.getProxyAttr(name)
        return this.__.__get(name)
    },

    setProxyAttr(name: string, newValue: __Value): void {
        if (this.proxyData[name] !== newValue) this.proxyData[name] = newValue
    },

    getProxyAttr(name: string): __Value {
        return this.proxyData[name]
    }

}