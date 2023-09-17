import { ILeaf, ILeafArrayMap, ILeafMap, ISelector, ISelectPathResult, ISelectPathOptions, IPointData, IEventListenerId, ISelectorConfig } from '@leafer/interface'
import { ChildEvent, LayoutEvent, DataHelper, Platform } from '@leafer/core'

import { FindPath } from './FindPath'


interface IFind {
    (leaf: ILeaf): boolean
}


export class Selector implements ISelector {

    public target: ILeaf

    public config: ISelectorConfig = {}

    protected findPath: FindPath

    protected innerIdList: ILeafMap = {}
    protected idList: ILeafMap = {}
    protected classNameList: ILeafArrayMap = {}
    protected tagNameList: ILeafArrayMap = {}

    protected __eventIds: IEventListenerId[]

    constructor(target: ILeaf, userConfig?: ISelectorConfig) {
        this.target = target
        if (userConfig) this.config = DataHelper.default(userConfig, this.config)
        this.findPath = new FindPath(target, this)
        this.__listenEvents()
    }

    public getByPoint(hitPoint: IPointData, hitRadius: number, options?: ISelectPathOptions): ISelectPathResult {
        if (Platform.name === 'node') this.target.emit(LayoutEvent.CHECK_UPDATE)
        return this.findPath.getByPoint(hitPoint, hitRadius, options)
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
            if (leaf.__tag === name) find.push(leaf)
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
            if (branch.isBranch) this.loopFind(branch, find)
        }
    }

    protected __onRemoveChild(event: ChildEvent): void {
        const target = event.target as ILeaf
        if (this.idList[target.id]) this.idList[target.id] = null
        if (this.innerIdList[target.id]) this.innerIdList[target.innerId] = null
    }


    protected __listenEvents(): void {
        this.__eventIds = [
            this.target.on_(ChildEvent.REMOVE, this.__onRemoveChild, this)
        ]
    }

    protected __removeListenEvents(): void {
        this.target.off_(this.__eventIds)
        this.__eventIds.length = 0
    }

    public destroy(): void {
        if (this.__eventIds.length) {
            this.__removeListenEvents()
            this.findPath.destroy()
            this.innerIdList = {}
            this.idList = {}
            this.classNameList = {}
            this.tagNameList = {}
        }
    }

}