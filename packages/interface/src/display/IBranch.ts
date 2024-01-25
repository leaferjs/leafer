import { ILeaf } from './ILeaf'
import { ILeaferCanvas } from '../canvas/ILeaferCanvas'
import { IRenderOptions } from '../renderer/IRenderer'

export interface IBranch extends ILeaf {
    children: ILeaf[]
    __renderBranch?(canvas: ILeaferCanvas, options: IRenderOptions): void
    addMany(...children: ILeaf[]): void
    removeAll(destroy?: boolean): void
    clear(): void
}