import { ILeaferCanvas } from '../../canvas/ILeaferCanvas'
import { IRenderOptions } from '../../renderer/IRenderer'
import { ILeaf } from '../ILeaf'

export type ILeafRenderModule = ILeafRender & ThisType<ILeaf>

export interface ILeafRender {
    __render?(canvas: ILeaferCanvas, options: IRenderOptions): void
    __draw?(canvas: ILeaferCanvas, options: IRenderOptions): void
    __drawFast?(canvas: ILeaferCanvas, options: IRenderOptions): void

    __drawBefore?(canvas: ILeaferCanvas, options: IRenderOptions): void
    __drawAfter?(canvas: ILeaferCanvas, options: IRenderOptions): void

    __updateWorldOpacity?(): void
    __updateRenderTime?(): void
    __updateChange?(): void
}