import { IFunction } from '../function/IFunction'
import { ILeaferCanvas } from '../canvas/ILeaferCanvas'

export interface IPlatform {
    requestRender?(render: IFunction): void
    canvas?: ILeaferCanvas
}