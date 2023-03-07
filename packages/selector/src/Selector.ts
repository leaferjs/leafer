import { ILeaf, ILeafArrayMap, ILeafMap, ISelector, ISelectPathResult, ISelectPathOptions, IPointData, ILeafList, IEventListenerId } from '@leafer/interface'
import { ChildEvent } from '@leafer/event'
import { LeafList } from '@leafer/list'

import { PathFinder } from './PathFinder'


interface IFind {
    (leaf: ILeaf): boolean
}


export class Selector implements ISelector {

    public target: ILeaf
    protected pathFinder: PathFinder

    public defaultPath: ILeafList

    protected eventIds: IEventListenerId[]

    protected innerIdList: ILeafMap = {}
    protected idList: ILeafMap = {}
    protected classNameList: ILeafArrayMap = {}
    protected tagNameList: ILeafArrayMap = {}

    constructor(target: ILeaf) {
        this.target = target
        this.defaultPath = new LeafList(target)
        this.pathFinder = new PathFinder(target, this)
        this.listenEvents()
    }

    protected listenEvents(): void {
        this.eventIds = [
            this.target.on__(ChildEvent.REMOVE, this.onRemoveChild, this)
        ]
    }

    protected removeListenEvents(): void {
        this.target.off__(this.eventIds)
    }

    protected onRemoveChild(event: ChildEvent): void {
        const target = event.target as ILeaf
        if (this.idList[target.id]) this.idList[target.id] = undefined
        if (this.innerIdList[target.id]) this.innerIdList[target.innerId] = undefined
    }

    public getHitPointPath(hitPoint: IPointData, hitRadius: number, options?: ISelectPathOptions): ISelectPathResult {
        return this.pathFinder.getHitPointPath(hitPoint, hitRadius, options)
    }


    public find(name: number | string, branch?: ILeaf): ILeaf | ILeaf[] {
        if (typeof name === 'number') {
            return this.getByInnerId(name, branch)
        } else if (name.startsWith('#')) {
            return this.getById(name.substring(1), branch)
        } else if (name.startsWith('.')) {
            return this.getByClassName(name.substring(1), branch)
        } else {
            return this.getByTagName(name, branch)
        }
    }

    public getByInnerId(name: number, branch?: ILeaf): ILeaf {
        let cache = this.innerIdList[name]
        if (cache) return cache
        if (!branch) branch = this.target
        let find: ILeaf
        this.loopFind(branch, (leaf) => {
            if (leaf.innerId === name) {
                find = leaf
                this.innerIdList[name] = find
                return true
            } else {
                return false
            }
        })
        return find
    }

    public getById(name: string, branch?: ILeaf): ILeaf {
        let cache = this.idList[name]
        if (cache) return cache
        if (!branch) branch = this.target
        let find: ILeaf
        this.loopFind(branch, (leaf) => {
            if (leaf.id === name) {
                find = leaf
                this.idList[name] = find
                return true
            } else {
                return false
            }
        })
        return find
    }

    public getByClassName(name: string, branch?: ILeaf): ILeaf[] {
        if (!branch) branch = this.target
        let find: Array<ILeaf | ILeaf> = []
        this.loopFind(branch, (leaf) => {
            if (leaf.className === name) find.push(leaf)
            return false
        })
        return find
    }

    public getByTagName(name: string, branch?: ILeaf): ILeaf[] {
        if (!branch) branch = this.target
        let find: Array<ILeaf | ILeaf> = []
        this.loopFind(branch, (leaf) => {
            if (leaf.tag === name) find.push(leaf)
            return false
        })
        return find
    }

    protected loopFind(branch: ILeaf, find: IFind): void {
        if (find(branch)) return
        const { children } = branch
        for (let i = 0, len = children.length; i < len; i++) {
            branch = children[i] as ILeaf
            if (find(branch)) return
            if (branch.__isBranch) this.loopFind(branch, find)
        }
    }

    public destroy(): void {
        if (this.target) {
            this.removeListenEvents()
            this.pathFinder.destroy()

            this.target = undefined
            this.pathFinder = undefined
            this.innerIdList = undefined
            this.idList = undefined
            this.classNameList = undefined
            this.tagNameList = undefined
        }
    }

}