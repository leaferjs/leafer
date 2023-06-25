import { ILeaf, IBoundsData } from '@leafer/interface'


export const LeafBoundsHelper = {

    worldBounds(target: ILeaf): IBoundsData {
        return target.__world
    },

    localBoxBounds(target: ILeaf): IBoundsData {
        return target.__local
    },

    localEventBounds(target: ILeaf): IBoundsData {
        return target.__layout.localStrokeBounds
    },

    localRenderBounds(target: ILeaf): IBoundsData {
        return target.__layout.localRenderBounds
    },

    maskLocalBoxBounds(target: ILeaf): IBoundsData {
        return target.isMask ? target.__local : null
    },

    maskLocalEventBounds(target: ILeaf): IBoundsData {
        return target.isMask ? target.__layout.localStrokeBounds : null
    },

    maskLocalRenderBounds(target: ILeaf): IBoundsData {
        return target.isMask ? target.__layout.localRenderBounds : null
    }

}
