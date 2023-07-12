import { ILeaferCanvas } from '../canvas/ILeaferCanvas'
import { IRenderOptions } from '../renderer/IRenderer'
import { ILeaf } from './ILeaf'

export interface IBranch extends ILeaf {
    children: ILeaf[]
    __renderBranch?(canvas: ILeaferCanvas, options: IRenderOptions): void
}