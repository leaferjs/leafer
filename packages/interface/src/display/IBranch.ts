import { ILeaf } from './ILeaf'

export interface IBranch extends ILeaf {
    children: ILeaf[]

    __updateSortChildren(): void
    add(child: ILeaf, index?: number): void
    remove(child?: ILeaf): void
}