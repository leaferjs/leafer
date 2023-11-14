import { ILeaf, IBoundsData } from '@leafer/interface'


export const LeafBoundsHelper = {

    worldBounds(target: ILeaf): IBoundsData {
        return target.__world
    },

    localBoxBounds(target: ILeaf): IBoundsData {
        return target.__.isEraser ? null : (target.__local || target.__ as IBoundsData)
    },

    localStrokeBounds(target: ILeaf): IBoundsData {
        return target.__.isEraser ? null : target.__layout.localStrokeBounds
    },

    localRenderBounds(target: ILeaf): IBoundsData {
        return target.__.isEraser ? null : target.__layout.localRenderBounds
    },

    maskLocalBoxBounds(target: ILeaf): IBoundsData {
        return target.__.isMask ? target.__localBounds : null
    },

    maskLocalStrokeBounds(target: ILeaf): IBoundsData {
        return target.__.isMask ? target.__layout.localStrokeBounds : null
    },

    maskLocalRenderBounds(target: ILeaf): IBoundsData {
        return target.__.isMask ? target.__layout.localRenderBounds : null
    }

}
