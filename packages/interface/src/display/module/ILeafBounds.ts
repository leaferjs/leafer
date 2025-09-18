import { ILeaf } from '../ILeaf'
import { IFourNumber } from '../../data/IData'

export type ILeafBoundsModule = ILeafBounds & ThisType<ILeaf>

export interface ILeafBounds {
    __updateWorldBounds?(): void
    __updateLocalBounds?(): void

    __updateLocalBoxBounds?(): void
    __updateLocalStrokeBounds?(): void
    __updateLocalRenderBounds?(): void

    __updateBoxBounds?(secondLayout?: boolean): void
    __updateStrokeBounds?(): void
    __updateRenderBounds?(): void

    __updateAutoLayout?(): void
    __updateFlowLayout?(): void
    __updateNaturalSize?(): void

    __updateStrokeSpread?(): IFourNumber
    __updateRenderSpread?(): IFourNumber

    __onUpdateSize?(): void
}

