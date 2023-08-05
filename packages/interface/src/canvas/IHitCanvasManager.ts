import { ILeaf } from '../display/ILeaf'
import { IScreenSizeData } from '../math/IMath'
import { ICanvasManager } from './ICanvasManager'
import { IHitCanvas } from './ILeaferCanvas'

export interface IHitCanvasManager extends ICanvasManager {
    getPathType(leaf: ILeaf): IHitCanvas
    getImageType(leaf: ILeaf, size: IScreenSizeData): IHitCanvas
    destroy(): void
}