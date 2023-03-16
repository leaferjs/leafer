import { ILeaf, ILeafArrayMap, ILeafLevelList, ILeafListItemCallback, INumberMap } from '@leafer/interface'

export class LeafLevelList implements ILeafLevelList {

    public levelMap: ILeafArrayMap
    public keys: INumberMap
    public levels: number[]

    public get length(): number { return this._length }
    private _length = 0

    constructor(item?: ILeaf | ILeaf[]) {
        this.reset()
        if (item) item instanceof Array ? this.pushList(item) : this.push(item)
    }

    public has(leaf: ILeaf): boolean {
        return this.keys[leaf.innerId] !== undefined
    }

    public without(leaf: ILeaf): boolean {
        return this.keys[leaf.innerId] === undefined
    }

    public sort(reverse?: boolean): void {
        const { levels } = this
        if (reverse) {
            levels.sort((a, b) => b - a) // 倒序
        } else {
            levels.sort((a, b) => a - b) // 顺序
        }
    }

    public pushList(list: ILeaf[]): void {
        list.forEach(leaf => { this.push(leaf) })
    }

    public push(leaf: ILeaf): void {
        const { keys, levelMap } = this
        if (!keys[leaf.innerId]) {
            keys[leaf.innerId] = 1
            if (!levelMap[leaf.__level]) {
                levelMap[leaf.__level] = [leaf]
                this.levels.push(leaf.__level)
            } else {
                levelMap[leaf.__level].push(leaf)
            }
            this._length++
        }
    }

    public forEach(itemCallback: ILeafListItemCallback): void {
        let list: ILeaf[]
        this.levels.forEach(level => {
            list = this.levelMap[level]
            for (let i = 0, len = list.length; i < len; i++) {
                itemCallback(list[i])
            }
        })
    }

    public reset(): void {
        this.levelMap = {}
        this.keys = {}
        this.levels = []
        this._length = 0
    }

    public destroy(): void {
        this.levelMap = null
    }

}