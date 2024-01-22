import { ILeaf, IBoundsData, IRenderOptions } from '@leafer/interface'


export const LeafBoundsHelper = {

    worldBounds(target: ILeaf): IBoundsData {
        return target.__world
    },

    localBoxBounds(target: ILeaf): IBoundsData {
        return target.__.eraser ? null : (target.__local || target.__layout)
    },

    localStrokeBounds(target: ILeaf): IBoundsData {
        return target.__.eraser ? null : target.__layout.localStrokeBounds
    },

    localRenderBounds(target: ILeaf): IBoundsData {
        return target.__.eraser ? null : target.__layout.localRenderBounds
    },

    maskLocalBoxBounds(target: ILeaf): IBoundsData {
        return target.__.mask ? target.__localBoxBounds : null
    },

    maskLocalStrokeBounds(target: ILeaf): IBoundsData {
        return target.__.mask ? target.__layout.localStrokeBounds : null
    },

    maskLocalRenderBounds(target: ILeaf): IBoundsData {
        return target.__.mask ? target.__layout.localRenderBounds : null
    },

    excludeRenderBounds(child: ILeaf, options: IRenderOptions): boolean {
        if (options.bounds && !options.bounds.hit(child.__world, options.matrix)) return true
        if (options.hideBounds && options.hideBounds.includes(child.__world, options.matrix)) return true
        return false
    }

}
