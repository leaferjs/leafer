import { ILeaf, IBoundsData } from '@leafer/interface'


export const LeafBoundsHelper = {

    worldBounds(target: ILeaf): IBoundsData {
        return target.__world
    },

    relativeBoxBounds(target: ILeaf): IBoundsData {
        return target.__relative
    },

    relativeEventBounds(target: ILeaf): IBoundsData {
        return target.__layout.relativeEventBounds
    },

    relativeRenderBounds(target: ILeaf): IBoundsData {
        return target.__layout.relativeRenderBounds
    }

}
