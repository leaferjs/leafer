import { ILeaf } from '../display/ILeaf'
import { ICanvasManager } from './ICanvasManager'
import { IHitCanvas, ILeaferCanvasConfig } from './ILeaferCanvas'

export interface IHitCanvasManager extends ICanvasManager {
    maxTotal: number // 最多缓存多少张画布
    getPathType(leaf: ILeaf): IHitCanvas
    getPixelType(leaf: ILeaf, config: ILeaferCanvasConfig): IHitCanvas
}