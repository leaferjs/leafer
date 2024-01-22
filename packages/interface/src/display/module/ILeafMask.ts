import { ILeaf } from '../ILeaf'
import { ILeaferCanvas } from '../../canvas/ILeaferCanvas'
import { IRenderOptions } from '../../renderer/IRenderer'

export type ILeafMaskModule = ILeafMask & ThisType<ILeaf>

export interface ILeafMask {
    __updateEraser?(value?: boolean): void
    __updateMask?(value?: boolean): void
    __renderMask?(canvas: ILeaferCanvas, options: IRenderOptions): void
    __removeMask?(child?: ILeaf): void
}

