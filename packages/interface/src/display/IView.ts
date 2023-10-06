import { IBranch } from './IBranch'
import { ILeaf } from './ILeaf'

export interface IZoomView extends IBranch {
    zoomLayer?: ILeaf
    moveLayer?: ILeaf
    setZoomLayer(zoomLayer: ILeaf, moveLayer?: ILeaf): void
}