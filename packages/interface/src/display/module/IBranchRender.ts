import { IBranch } from '../IBranch'
import { ILeafRender } from './ILeafRender'

export type IBranchRenderModule = IBranchRender & ThisType<IBranch>

export interface IBranchRender extends ILeafRender { }