import { ILeaf } from '../display/ILeaf'
import { ILeafList } from '../data/IList'
import { IPointData } from '../math/IMath'
import { IBranch } from '../display/IBranch'

export interface IPickResult {
    target: ILeaf
    path: ILeafList
    throughPath?: ILeafList
}

export interface IPickOptions {
    name?: string
    hitRadius?: number
    through?: boolean
    target?: IBranch
    findList?: ILeaf[]
    bottomList?: IPickBottom[]  // 底部可拾取的虚拟元素
    exclude?: ILeafList
    ignoreHittable?: boolean
}

export interface IPickBottom {
    target: ILeaf
    proxy?: ILeaf
}

export interface ISelectorConfig {

}

export type IAnswer = 0 | 1 | 2 | 3

export interface IFindCondition {
    id?: number | string,
    className?: string,
    tag?: string | string[]
}

export interface IFindMethod {
    (leaf: ILeaf, options?: any): IAnswer
}

export interface ISelectorProxy {
    list: ILeaf[]
    dragHoverExclude: ILeaf[] // drag hover 过程中需排除的元素列表
}

export interface ISelector {
    target?: ILeaf

    proxy?: ISelectorProxy

    config: ISelectorConfig

    getByPoint(hitPoint: IPointData, hitRadius: number, options?: IPickOptions): IPickResult

    getBy(condition: number | string | IFindMethod, branch?: ILeaf, one?: boolean, options?: any): ILeaf | ILeaf[]
    getByInnerId(innerId: number, branch?: ILeaf): ILeaf
    getById(id: string, branch?: ILeaf): ILeaf
    getByClassName(className: string, branch?: ILeaf): ILeaf[]
    getByTag(tag: string, branch?: ILeaf): ILeaf[]
    getByMethod(method: IFindMethod, branch?: ILeaf, one?: boolean, options?: any): ILeaf | ILeaf[]
    destroy(): void
}