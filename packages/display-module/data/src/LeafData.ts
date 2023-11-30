import { ILeafData, ILeaf, IObject, IValue } from '@leafer/interface'


export class LeafData implements ILeafData {

    public __leaf: ILeaf
    public __input: IObject
    public __middle: IObject

    public __single: boolean

    public __naturalWidth?: number
    public __naturalHeight?: number

    constructor(leaf: ILeaf) {
        this.__leaf = leaf
    }

    public __get(name: string): any {
        if (this.__input) {
            const value = this.__input[name]
            if (value !== undefined) return value
        }
        return (this as IObject)[name]
    }

    public __getData(): IObject {
        const data: IObject = { tag: this.__leaf.tag }, { __input } = this
        let inputValue: IValue
        for (let key in this) {
            if (key[0] !== '_') {
                inputValue = __input ? __input[key] : undefined
                data[key] = (inputValue === undefined) ? this[key] : inputValue
            }
        }
        return data
    }

    public __setInput(name: string, value: any): void {
        this.__input || (this.__input = {})
        this.__input[name] = value
    }

    public __getInput(name: string): any {
        if (this.__input) {
            const value = this.__input[name]
            if (value !== undefined) return value
        }
        return (this as IObject)['_' + name]
    }

    public __removeInput(name: string): void {
        if (this.__input && this.__input[name] !== undefined) this.__input[name] = undefined
    }

    public __getInputData(): IObject {
        const data: IObject = { tag: this.__leaf.tag }, { __input } = this
        let value: IValue, inputValue: IValue
        for (let key in this) {
            if (key[0] !== '_') {
                value = (this as IObject)['_' + key]
                if (value !== undefined) {
                    inputValue = __input ? __input[key] : undefined
                    data[key] = (inputValue === undefined) ? value : inputValue
                }
            }
        }
        return data
    }

    public __setMiddle(name: string, value: any): void {
        this.__middle || (this.__middle = {})
        this.__middle[name] = value
    }

    public __getMiddle(name: string): any {
        return this.__middle && this.__middle[name]
    }

    public __checkSingle(): void {
        if ((this as ILeafData).blendMode === 'pass-through') {
            if (this.__leaf.__hasEraser || (this as ILeafData).isEraser) {
                this.__single = true
            } else if (this.__single) {
                this.__single = false
            }
        } else {
            this.__single = true
        }
    }

    public destroy(): void {
        this.__input = this.__middle = null
    }
}