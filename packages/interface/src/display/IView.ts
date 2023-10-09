import { IBranch } from './IBranch'
import { ILeaf } from './ILeaf'

export interface IZoomView extends IBranch {
    zoomLayer?: ILeaf
    setZoomLayer(zoomLayer: ILeaf): void
}