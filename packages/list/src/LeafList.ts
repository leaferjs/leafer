import { ILeaf, ILeafList, ILeafListItemCallback, INumberMap } from '@leafer/interface'

export class LeafList implements ILeafList {

    public list: ILeaf[]
    public keys: INumberMap

    public get length(): number { return this.list.length }

    constructor(item?: ILeaf | ILeaf[]) {
        this.reset()
        if (item) item instanceof Array ? this.pushList(item) : this.push(item)
    }

    public has(leaf: ILeaf): boolean {
        return leaf && this.keys[leaf.innerId] !== undefined
    }

    public indexAt(index: number): ILeaf {
        return this.list[index]
    }

    public indexOf(leaf: ILeaf): number {
        const index = this.keys[leaf.innerId]
        return index === undefined ? -1 : index
    }

    public pushList(list: ILeaf[]): void {
        list.forEach(leaf => { this.push(leaf) })
    }

    public unshift(leaf: ILeaf): void {
        const { keys } = this
        if (keys[leaf.innerId] === undefined) {
            this.list.unshift(leaf)
            Object.keys(keys).forEach(innerId => {
                if (keys[innerId] !== undefined) keys[innerId]++
            })
            keys[leaf.innerId] = 0
        }
    }

    public push(leaf: ILeaf): void {
        const { list, keys } = this
        if (keys[leaf.innerId] === undefined) {
            list.push(leaf)
            keys[leaf.innerId] = list.length - 1
        }
    }

    public sort(reverse?: boolean): void {
        const { list } = this
        if (reverse) {
            list.sort((a, b) => b.__level - a.__level) // 倒序
        } else {
            list.sort((a, b) => a.__level - b.__level) // 顺序
        }
    }

    public remove(leaf: ILeaf): void {
        const { list } = this
        let findIndex: number
        for (let i = 0, len = list.length; i < len; i++) {
            if (findIndex !== undefined) {
                this.keys[list[i].innerId] = i - 1 // update rest keys
            } else if (list[i].innerId === leaf.innerId) {
                findIndex = i
                delete this.keys[leaf.innerId]
            }
        }

        if (findIndex !== undefined) list.splice(findIndex, 1)
    }

    public forEach(itemCallback: ILeafListItemCallback): void {
        this.list.forEach(itemCallback)
    }

    public clone(): ILeafList {
        const list = new LeafList()
        this.list.forEach(item => { list.push(item) })
        return list
    }

    public reset(): void {
        this.list = []
        this.keys = {}
    }

    public destroy(): void {
        this.list = null
    }
}
