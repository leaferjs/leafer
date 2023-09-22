import { ILeaf } from '../ILeaf'

export type ILeafBoundsModule = ILeafBounds & ThisType<ILeaf>

export interface ILeafBounds {
    __updateWorldBounds?(): void

    __updateLocalBoxBounds?(): void
    __updateLocalStrokeBounds?(): void
    __updateLocalRenderBounds?(): void

    __updateBoxBounds?(): void
    __updateStrokeBounds?(): void
    __updateRenderBounds?(): void

    __updateNaturalSize?(): void

    __updateStrokeSpread?(): number
    __updateRenderSpread?(): number

    __onUpdateSize?(): void
}

