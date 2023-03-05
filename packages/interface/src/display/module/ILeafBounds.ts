import { ILeaf } from '../ILeaf'

export type ILeafBoundsModule = ILeafBounds & ThisType<ILeaf>

export interface ILeafBounds {
    __updateWorldBounds?(): void

    __updateRelativeBoxBounds?(): void
    __updateRelativeEventBounds?(): void
    __updateRelativeRenderBounds?(): void

    __updateBoxBounds?(): void
    __updateEventBounds?(): void
    __updateRenderBounds?(): void

    __updateEventBoundsSpreadWidth?(): number
    __updateRenderBoundsSpreadWidth?(): number

    __onUpdateSize?(): void
}

