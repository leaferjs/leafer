import { ILeafDataProxyModule } from '@leafer/interface'
import { AttrEvent } from '@leafer/event'


export const LeafDataProxy: ILeafDataProxyModule = {

    __set(attrName: string, newValue: unknown): void {
        const oldValue = this.__.__getInput(attrName)
        if (oldValue !== newValue) {
            this.__[attrName] = newValue
            this.root.emitEvent(new AttrEvent(AttrEvent.CHANGE, this, attrName, oldValue, newValue))
        }
    },

    __get(attrName: string): unknown {
        return this.__.__getInput(attrName)
    },

    __updateAttr(attrName: string): void {
        const value = this.__.__getInput(attrName)
        this.root?.emitEvent(new AttrEvent(AttrEvent.CHANGE, this, attrName, value, value))
    }

}