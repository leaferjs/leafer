import { ILeaf, ILeafMap, ILeafList, ISelector, ISelectPathResult, ISelectPathOptions, IPointData, IEventListenerId, ISelectorConfig, IFindFunction } from '@leafer/interface'
import { ChildEvent, LayoutEvent, DataHelper, Platform, PropertyEvent, LeafHelper } from '@leafer/core'

import { Pather } from './Pather'


export class Selector implements ISelector {

    public target: ILeaf

    public list: ILeafList

    public config: ISelectorConfig = {}

    protected pather: Pather


    protected innerIdMap: ILeafMap = {}
    protected idMap: ILeafMap = {}

    protected findLeaf: ILeaf
    protected rootChildren: ILeaf[]

    protected conditions = {
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

    protected __eventIds: IEventListenerId[]


    constructor(target: ILeaf, userConfig?: ISelectorConfig) {
        this.target = target
        if (userConfig) this.config = DataHelper.default(userConfig, this.config)
        this.pather = new Pather(target, this)
        this.__listenEvents()
    }

    public getByPoint(hitPoint: IPointData, hitRadius: number, options?: ISelectPathOptions): ISelectPathResult {
        if (Platform.name === 'node') this.target.emit(LayoutEvent.CHECK_UPDATE)
        return this.pather.getByPoint(hitPoint, hitRadius, options)
    }

    public getBy(condition: number | string | IFindFunction, branch?: ILeaf, one?: boolean): ILeaf | ILeaf[] {
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
                        list = this.getByClassName(condition.substring(1), branch, one)
                        break
                    default:
                        list = this.getByTagName(condition, branch, one)
                }
                break
            case 'function':
                list = this.getByFunction(condition, branch, one)
        }
        return one ? (list ? list[0] : leaf) : (list || (leaf ? [leaf] : []))
    }

    public getByInnerId(name: number, branch?: ILeaf): ILeaf {
        const cache = this.innerIdMap[name]
        if (cache) return cache
        this.eachFind(this.toChildren(branch), this.conditions.innerId, name)
        return this.findLeaf
    }

    public getById(name: string, branch?: ILeaf): ILeaf {
        const cache = this.idMap[name]
        if (cache && LeafHelper.hasParent(cache, branch || this.target)) return cache
        this.eachFind(this.toChildren(branch), this.conditions.id, name)
        return this.findLeaf
    }

    public getByClassName(name: string, branch?: ILeaf, one?: boolean): ILeaf[] {
        const list: ILeaf[] = one ? null : []
        this.eachFind(this.toChildren(branch), this.conditions.class, name, list)
        return list || this.toFindList()
    }

    public getByTagName(name: string, branch?: ILeaf, one?: boolean): ILeaf[] {
        const list: ILeaf[] = one ? null : []
        this.eachFind(this.toChildren(branch), this.conditions.tag, name, list)
        return list || this.toFindList()
    }

    public getByFunction(condition: IFindFunction, branch?: ILeaf, one?: boolean): ILeaf[] {
        const list: ILeaf[] = one ? null : []
        this.eachFind(this.toChildren(branch), condition, null, list)
        return list || this.toFindList()
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
        this.rootChildren[0] = branch
        return this.rootChildren
    }

    protected toFindList(): ILeaf[] {
        return this.findLeaf ? [this.findLeaf] : []
    }


    protected __onRemoveChild(event: ChildEvent): void {
        const { id, innerId } = event.child
        if (this.idMap[id]) delete this.idMap[id]
        if (this.innerIdMap[innerId]) delete this.innerIdMap[innerId]
    }

    protected __checkIdChange(event: PropertyEvent): void {
        if (event.attrName === 'id') {
            const { id } = event.target as ILeaf
            if (this.idMap[id]) delete this.idMap[id]
        }
    }


    protected __listenEvents(): void {
        this.__eventIds = [
            this.target.on_(ChildEvent.REMOVE, this.__onRemoveChild, this),
            this.target.on_(PropertyEvent.CHANGE, this.__checkIdChange, this)
        ]
    }

    protected __removeListenEvents(): void {
        this.target.off_(this.__eventIds)
        this.__eventIds.length = 0
    }

    public destroy(): void {
        if (this.__eventIds.length) {
            this.__removeListenEvents()
            this.pather.destroy()
            this.findLeaf = null
            this.rootChildren.length = 0
            this.innerIdMap = {}
            this.idMap = {}
        }
    }

}