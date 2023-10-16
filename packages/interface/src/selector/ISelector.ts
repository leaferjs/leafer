import { ILeaf } from '../display/ILeaf'
import { ILeafList } from '../data/IList'
import { IPointData } from '../math/IMath'

export interface ISelectPathResult {
    leaf: ILeaf
    path: ILeafList
    throughPath?: ILeafList
}

export interface ISelectPathOptions {
    name?: string
    through?: boolean
    exclude?: ILeafList
    ignoreHittable?: boolean
}

export interface ISelectorConfig {

}

export interface IFindFunction {
    (leaf: ILeaf, options?: any): boolean
}

export interface ISelector {
    target: ILeaf

    list: ILeafList

    config: ISelectorConfig

    getByPoint(hitPoint: IPointData, hitRadius: number, options?: ISelectPathOptions): ISelectPathResult

    getBy(condition: number | string | IFindFunction, branch?: ILeaf, multiple?: boolean): ILeaf | ILeaf[]
    getByInnerId(name: number, branch?: ILeaf): ILeaf
    getById(name: string, branch?: ILeaf): ILeaf
    getByClassName(name: string, branch?: ILeaf, one?: boolean): ILeaf[]
    getByTagName(name: string, branch?: ILeaf, one?: boolean): ILeaf[]
    getByFunction(condition: IFindFunction, branch?: ILeaf, one?: boolean): ILeaf[]
    destroy(): void
}