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

export enum AnswerType {
    No = 0,
    Yes = 1,
    NoAndSkip = 2,
    YesAndSkip = 3
}

export interface IFindMethod {
    (leaf: ILeaf, options?: any): AnswerType
}

export interface ISelector {
    target: ILeaf

    list: ILeafList

    config: ISelectorConfig

    getByPoint(hitPoint: IPointData, hitRadius: number, options?: ISelectPathOptions): ISelectPathResult

    getBy(condition: number | string | IFindMethod, branch?: ILeaf, one?: boolean, options?: any): ILeaf | ILeaf[]
    getByInnerId(innerId: number, branch?: ILeaf): ILeaf
    getById(id: string, branch?: ILeaf): ILeaf
    getByClassName(className: string, branch?: ILeaf): ILeaf[]
    getByTag(tag: string, branch?: ILeaf): ILeaf[]
    getByMethod(method: IFindMethod, branch?: ILeaf, one?: boolean, options?: any): ILeaf | ILeaf[]
    destroy(): void
}