import { ILeaf, IBoundsData, IRenderOptions } from '@leafer/interface'


export const LeafBoundsHelper = {

    worldBounds(target: ILeaf): IBoundsData {
        return target.__world
    },

    localBoxBounds(target: ILeaf): IBoundsData {
        return target.__.eraser || target.__.visible === 0 ? null : (target.__local || target.__layout)
    },

    localStrokeBounds(target: ILeaf): IBoundsData {
        return target.__.eraser || target.__.visible === 0 ? null : target.__layout.localStrokeBounds
    },

    localRenderBounds(target: ILeaf): IBoundsData {
        return target.__.eraser || target.__.visible === 0 ? null : target.__layout.localRenderBounds
    },

    maskLocalBoxBounds(target: ILeaf, index: number): IBoundsData {
        return checkMask(target, index) && target.__localBoxBounds
    },

    maskLocalStrokeBounds(target: ILeaf, index: number): IBoundsData {
        return checkMask(target, index) && target.__layout.localStrokeBounds
    },

    maskLocalRenderBounds(target: ILeaf, index: number): IBoundsData {
        return checkMask(target, index) && target.__layout.localRenderBounds
    },

    excludeRenderBounds(child: ILeaf, options: IRenderOptions): boolean {
        if (options.bounds && !options.bounds.hit(child.__world, options.matrix)) return true
        if (options.hideBounds && options.hideBounds.includes(child.__world, options.matrix)) return true
        return false
    }

}


let findMask: number

function checkMask(target: ILeaf, index: number): boolean {
    if (!index) findMask = 0
    if (target.__.mask) findMask = 1
    return findMask < 0 ? null : (findMask && (findMask = -1), true) // 第一个 mask 元素之后的元素 bounds 可以忽略，返回 null
}