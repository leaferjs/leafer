import { ILeafData, ILeaf, IObject } from '@leafer/interface'


export class LeafData implements ILeafData {

    public __leaf: ILeaf
    public __input: IObject
    public __middle: IObject

    constructor(leaf: ILeaf) {
        this.__leaf = leaf
    }

    public __setInput(name: string, value: any): void {
        this.__input || (this.__input = {})
        this.__input[name] = value
    }

    public __getInput(name: string): any {
        if (this.__input) {
            const value = this.__input[name]
            return value === undefined ? (this as IObject)[name] : value
        } else {
            return (this as IObject)[name]
        }
    }

    public __setMiddle(name: string, value: any): void {
        this.__middle || (this.__middle = {})
        this.__middle[name] = value
    }

    public __getMiddle(name: string): any {
        return this.__middle && this.__middle[name]
    }

    public destroy(): void {
        this.__leaf = undefined
    }
}