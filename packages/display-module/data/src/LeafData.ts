import { ILeafData, ILeaf, IObject, IValue, IPathCommandData } from '@leafer/interface'


export class LeafData implements ILeafData {

    public __leaf: ILeaf
    public __input: IObject
    public __middle: IObject

    public __single: boolean

    public __naturalWidth?: number
    public __naturalHeight?: number

    public __pathInputed?: number
    public __pathForRender?: IPathCommandData

    public get __blendMode(): string {
        if ((this as ILeafData).eraser && (this as ILeafData).eraser !== 'path') return 'destination-out'
        const { blendMode } = (this as ILeafData)
        return blendMode === 'pass-through' ? null : blendMode
    }

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

        if (name === 'path' && !this.__pathInputed) return // no path mode

        return (this as IObject)['_' + name]
    }

    public __removeInput(name: string): void {
        if (this.__input && this.__input[name] !== undefined) this.__input[name] = undefined
    }

    public __getInputData(names?: string[] | IObject): IObject {
        const data: IObject = {}

        if (names) {

            if (names instanceof Array) {
                for (let name of names) data[name] = this.__getInput(name)
            } else {
                for (let name in names) data[name] = this.__getInput(name)
            }

        } else {

            let value: IValue, inputValue: IValue, { __input } = this
            data.tag = this.__leaf.tag
            for (let key in this) {
                if (key[0] !== '_') {
                    value = (this as IObject)['_' + key]
                    if (value !== undefined) {

                        if (key === 'path' && !this.__pathInputed) continue // no path mode

                        inputValue = __input ? __input[key] : undefined
                        data[key] = (inputValue === undefined) ? value : inputValue
                    }
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
        const t = this as ILeafData
        if (t.blendMode === 'pass-through') {
            const leaf = this.__leaf
            if ((t.opacity < 1 && leaf.isBranch) || leaf.__hasEraser || t.eraser) {
                t.__single = true
            } else if (t.__single) {
                t.__single = false
            }
        } else {
            t.__single = true
        }
    }

    public __removeNaturalSize(): void {
        this.__naturalWidth = this.__naturalHeight = undefined
    }

    public destroy(): void {
        this.__input = this.__middle = null
    }
}