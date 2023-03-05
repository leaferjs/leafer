import { IBranch } from './IBranch'
import { ILeaf } from './ILeaf'
import { ITransformEventData } from '../event/IEvent'

export interface IZoomView extends IBranch {
    zoomLayer?: ILeaf
    moveLayer?: ILeaf
    transformData?: ITransformEventData
}