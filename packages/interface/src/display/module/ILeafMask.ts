import { ILeaf } from '../ILeaf'
import { ILeaferCanvas } from '../../canvas/ILeaferCanvas'

export type ILeafMaskModule = ILeafMask & ThisType<ILeaf>

export interface ILeafMask {
    __updateMask?(value?: boolean): void
    __renderMask?(canvas: ILeaferCanvas, content: ILeaferCanvas, mask: ILeaferCanvas): void
    __removeMask?(child?: ILeaf): void
}

