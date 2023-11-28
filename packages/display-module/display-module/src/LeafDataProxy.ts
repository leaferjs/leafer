import { ILeafDataProxyModule, IObject, IValue } from '@leafer/interface'
import { PropertyEvent } from '@leafer/event'


export const LeafDataProxy: ILeafDataProxyModule = {

    __setAttr(name: string, newValue: IValue): void {
        if (this.leafer && this.leafer.created) {
            const oldValue = this.__.__getInput(name)
            if (typeof newValue === 'object' || oldValue !== newValue) {
                (this.__ as IObject)[name] = newValue
                if (this.proxyData) this.setProxyAttr(name, newValue)

                const { CHANGE } = PropertyEvent
                const event = new PropertyEvent(CHANGE, this, name, oldValue, newValue)
                if (this.hasEvent(CHANGE) && !this.isLeafer) this.emitEvent(event)
                this.leafer.emitEvent(event)
            }
        } else {
            (this.__ as IObject)[name] = newValue
            if (this.proxyData) this.setProxyAttr(name, newValue)
        }
    },

    __getAttr(name: string): IValue {
        if (this.proxyData) return this.getProxyAttr(name)
        return this.__.__get(name)
    },

    setProxyAttr(name: string, newValue: IValue): void {
        if ((this.proxyData as IObject)[name] !== newValue) (this.proxyData as IObject)[name] = newValue
    },

    getProxyAttr(name: string): IValue {
        return (this.proxyData as IObject)[name]
    }

}