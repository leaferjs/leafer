import { IBranch } from '../IBranch'
import { ILeafRender } from './ILeafRender'
import { ILeaferCanvas } from '../../canvas/ILeaferCanvas'
import { IRenderOptions } from '../../renderer/IRenderer'

export type IBranchRenderModule = IBranchRender & ThisType<IBranch>

export interface IBranchRender extends ILeafRender {
    __renderBranch?(canvas: ILeaferCanvas, options: IRenderOptions): void
}