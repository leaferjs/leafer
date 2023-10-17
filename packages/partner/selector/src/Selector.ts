import { ILeaf, ILeafMap, ILeafList, ISelector, ISelectPathResult, ISelectPathOptions, IPointData, IEventListenerId, ISelectorConfig, IFindFunction } from '@leafer/interface'
import { ChildEvent, LayoutEvent, DataHelper, Platform } from '@leafer/core'

import { FindPath } from './FindPath'


export class Selector implements ISelector {

    public target: ILeaf

    public list: ILeafList

    public config: ISelectorConfig = {}

    protected findPath: FindPath
    protected findLeaf: ILeaf

    protected __eventIds: IEventListenerId[]

    protected innerIdMap: ILeafMap = {}
    protected idMap: ILeafMap = {}

    protected findFunctions = {
        id: (leaf: ILeaf, name: string) => {
            if (leaf.id === name) {
                this.idMap[name] = leaf
                return true
            }
            return false
        },
        innerId: (leaf: ILeaf, innerId: number) => {
            if (leaf.innerId === innerId) {
                this.innerIdMap[innerId] = leaf
                return true
            }
            return false
        },
        class: (leaf: ILeaf, name: string) => {
            if (leaf.className === name) return true
            return false
        },
        tag: (leaf: ILeaf, name: string) => {
            if (leaf.__tag === name) return true
            return false
        }
    }


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

    public getBy(condition: number | string | IFindFunction, branch?: ILeaf, multiple?: boolean): ILeaf | ILeaf[] {
        let leaf: ILeaf, list: ILeaf[]
        switch (typeof condition) {
            case 'number':
                leaf = this.getByInnerId(condition, branch)
                break
            case 'string':
                switch (condition[0]) {
                    case '#':
                        leaf = this.getById(condition.substring(1), branch)
                        break
                    case '.':
                        list = this.getByClassName(condition.substring(1), branch, !multiple)
                        break
                    default:
                        list = this.getByTagName(condition, branch, !multiple)
                }
                break
            case 'function':
                list = this.getByFunction(condition, branch, !multiple)
        }
        return multiple ? (list || (leaf ? [leaf] : [])) : (list ? list[0] : leaf)
    }

    public getByInnerId(name: number, branch?: ILeaf): ILeaf {
        const cache = this.innerIdMap[name]
        if (cache) return cache
        this.eachFind(this.toChildren(branch), this.findFunctions.innerId, name)
        return this.findLeaf
    }

    public getById(name: string, branch?: ILeaf): ILeaf {
        const cache = this.idMap[name]
        if (cache) {
            if (branch) {
                let parent = branch
                while (parent) {
                    if (parent === branch) return cache
                    parent = parent.parent
                }
            } else return cache
        }
        this.eachFind(this.toChildren(branch), this.findFunctions.id, name)
        return this.findLeaf
    }

    public getByClassName(name: string, branch?: ILeaf, one?: boolean): ILeaf[] {
        const list: ILeaf[] = one ? null : []
        this.eachFind(this.toChildren(branch), this.findFunctions.class, name, list)
        return list || [this.findLeaf]
    }

    public getByTagName(name: string, branch?: ILeaf, one?: boolean): ILeaf[] {
        const list: ILeaf[] = one ? null : []
        this.eachFind(this.toChildren(branch), this.findFunctions.tag, name, list)
        return list || [this.findLeaf]
    }

    public getByFunction(condition: IFindFunction, branch?: ILeaf, one?: boolean): ILeaf[] {
        const list: ILeaf[] = one ? null : []
        this.eachFind(this.toChildren(branch), condition, null, list)
        return list || [this.findLeaf]
    }

    protected eachFind(children: ILeaf[], find: IFindFunction, options?: any, list?: ILeaf[]): void {
        let child: ILeaf
        for (let i = 0, len = children.length; i < len; i++) {
            child = children[i]
            if (find(child, options)) {
                if (list) {
                    list.push(child)
                } else {
                    this.findLeaf = child
                    return
                }
            }
            if (child.isBranch) this.eachFind(child.children, find, options, list)
        }
    }

    protected toChildren(branch: ILeaf): ILeaf[] {
        if (!branch) branch = this.target
        this.findLeaf = null
        return [branch]
    }


    protected __onRemoveChild(event: ChildEvent): void {
        const { id, innerId } = event.child as ILeaf
        if (this.idMap[id]) this.idMap[id] = null
        if (this.innerIdMap[innerId]) this.innerIdMap[innerId] = null
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
            this.innerIdMap = {}
            this.idMap = {}
        }
    }

}