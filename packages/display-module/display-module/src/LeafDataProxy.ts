import { ILeafDataProxyModule, IObject, IValue } from '@leafer/interface'
import { PropertyEvent, LeaferEvent, leaferTransformAttrMap } from '@leafer/event'
import { isObject, isFinite, isUndefined } from '@leafer/data'
import { Debug } from '@leafer/debug'


const debug = Debug.get('setAttr')

export const LeafDataProxy: ILeafDataProxyModule = {

    __setAttr(name: string, newValue: IValue, checkFiniteNumber?: boolean): boolean {
        if (this.leaferIsCreated) {

            const oldValue = this.__.__getInput(name)

            if (checkFiniteNumber && !isFinite(newValue) && !isUndefined(newValue)) { // 警告 NaN、Infinity、-Infinity、null、非有效数字
                debug.warn(this.innerName, name, newValue)
                newValue = undefined // must
            }

            if (isObject(newValue) || oldValue !== newValue) {

                this.__realSetAttr(name, newValue)

                const { CHANGE } = PropertyEvent
                const event = new PropertyEvent(CHANGE, this, name, oldValue, newValue)

                if (this.isLeafer) {
                    this.emitEvent(new PropertyEvent(PropertyEvent.LEAFER_CHANGE, this, name, oldValue, newValue))
                    const transformEventName = leaferTransformAttrMap[name]
                    if (transformEventName) {
                        this.emitEvent(new LeaferEvent(transformEventName, this))
                        this.emitEvent(new LeaferEvent(LeaferEvent.TRANSFORM, this))
                    }
                } else {
                    if (this.hasEvent(CHANGE)) this.emitEvent(event)
                }

                this.leafer.emitEvent(event)

                return true
            } else {
                return false
            }

        } else {

            this.__realSetAttr(name, newValue)

            return true

        }
    },

    __realSetAttr(name: string, newValue: IValue): void {
        const data = this.__ as IObject
        data[name] = newValue
        if (this.__proxyData) this.setProxyAttr(name, newValue)
        if (data.normalStyle) this.lockNormalStyle || isUndefined(data.normalStyle[name]) || (data.normalStyle[name] = newValue)
    },


    __getAttr(name: string): IValue {
        if (this.__proxyData) return this.getProxyAttr(name)
        return this.__.__get(name)
    }
}