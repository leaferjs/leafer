import { ILeaf } from '../display/ILeaf'
import { ICanvasManager } from './ICanvasManager'
import { IHitCanvas, ILeaferCanvasConfig } from './ILeaferCanvas'

export interface IHitCanvasManager extends ICanvasManager {
    getPathType(leaf: ILeaf): IHitCanvas
    getImageType(leaf: ILeaf, config: ILeaferCanvasConfig): IHitCanvas
}