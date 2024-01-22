import { ILeaferCanvas } from '../../canvas/ILeaferCanvas'
import { IRenderOptions } from '../../renderer/IRenderer'
import { ILeaf } from '../ILeaf'

export type ILeafRenderModule = ILeafRender & ThisType<ILeaf>

export interface ILeafRender {
    __render?(canvas: ILeaferCanvas, options: IRenderOptions): void
    __draw?(canvas: ILeaferCanvas, options: IRenderOptions): void
    __drawFast?(canvas: ILeaferCanvas, options: IRenderOptions): void

    __clip?(_canvas: ILeaferCanvas, _options: IRenderOptions): void
    __renderShape?(canvas: ILeaferCanvas, options: IRenderOptions): void

    __updateWorldOpacity?(): void
    __updateChange?(): void
}