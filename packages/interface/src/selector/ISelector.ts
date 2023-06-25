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

export interface ISelector {
    target: ILeaf

    config: ISelectorConfig

    getByPoint(hitPoint: IPointData, hitRadius: number, options?: ISelectPathOptions): ISelectPathResult

    find(name: number | string, branch?: ILeaf): ILeaf | ILeaf[]
    getByInnerId(name: number, branch?: ILeaf): ILeaf
    getById(name: string, branch?: ILeaf): ILeaf
    getByClassName(name: string, branch?: ILeaf): ILeaf[]
    getByTagName(name: string, branch?: ILeaf): ILeaf[]
    destroy(): void
}