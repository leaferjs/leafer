import { ILeaf } from './ILeaf'

export interface IBranch extends ILeaf {
    children: ILeaf[]
    addMany(...children: ILeaf[]): void
    removeAll(destroy?: boolean): void
    clear(): void
}