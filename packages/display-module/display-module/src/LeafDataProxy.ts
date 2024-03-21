import { ILeafDataProxyModule, IObject, IValue } from '@leafer/interface'
import { PropertyEvent } from '@leafer/event'
import { Debug } from '@leafer/debug'


const { isFinite } = Number
const debug = Debug.get('setAttr')

export const LeafDataProxy: ILeafDataProxyModule = {

    __setAttr(name: string, newValue: IValue, checkFiniteNumber?: boolean): void {
        if (this.leafer && this.leafer.created) {
            const oldValue = this.__.__getInput(name)

            if (checkFiniteNumber && !isFinite(newValue) && newValue !== undefined) { // 警告 NaN、Infinity、-Infinity、null、非有效数字
                debug.warn(this.innerName, name, newValue)
                newValue = undefined // must
            }

            if (typeof newValue === 'object' || oldValue !== newValue) {
                (this.__ as IObject)[name] = newValue
                if (this.__proxyData) this.setProxyAttr(name, newValue)

                const { CHANGE } = PropertyEvent
                const event = new PropertyEvent(CHANGE, this, name, oldValue, newValue)

                if (this.isLeafer) {
                    this.emitEvent(new PropertyEvent(PropertyEvent.LEAFER_CHANGE, this, name, oldValue, newValue))
                } else {
                    if (this.hasEvent(CHANGE)) this.emitEvent(event)
                }

                this.leafer.emitEvent(event)
            }

        } else {
            (this.__ as IObject)[name] = newValue
            if (this.__proxyData) this.setProxyAttr(name, newValue)
        }
    },

    __getAttr(name: string): IValue {
        if (this.__proxyData) return this.getProxyAttr(name)
        return this.__.__get(name)
    }
}