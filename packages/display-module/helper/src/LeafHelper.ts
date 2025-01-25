import { IAlign, ILeaf, IMatrixData, IPointData, IAxis, ITransition } from '@leafer/interface'
import { MathHelper, MatrixHelper, PointHelper, AroundHelper, getMatrixData, BoundsHelper } from '@leafer/math'


const { copy, toInnerPoint, toOuterPoint, scaleOfOuter, rotateOfOuter, skewOfOuter, multiplyParent, divideParent, getLayout } = MatrixHelper
const matrix = {} as IMatrixData

export const LeafHelper = {

    updateAllMatrix(leaf: ILeaf, checkAutoLayout?: boolean, waitAutoLayout?: boolean): void {
        if (checkAutoLayout && leaf.__hasAutoLayout && leaf.__layout.matrixChanged) waitAutoLayout = true

        updateMatrix(leaf, checkAutoLayout, waitAutoLayout)

        if (leaf.isBranch) {
            const { children } = leaf
            for (let i = 0, len = children.length; i < len; i++) {
                updateAllMatrix(children[i], checkAutoLayout, waitAutoLayout)
            }
        }
    },

    updateMatrix(leaf: ILeaf, checkAutoLayout?: boolean, waitAutoLayout?: boolean): void {
        const layout = leaf.__layout

        if (checkAutoLayout) {
            if (waitAutoLayout) {
                layout.waitAutoLayout = true
                if (leaf.__hasAutoLayout) layout.matrixChanged = false // wait updateAutoLayout
            }
        } else if (layout.waitAutoLayout) {
            layout.waitAutoLayout = false
        }

        if (layout.matrixChanged) leaf.__updateLocalMatrix()
        if (!layout.waitAutoLayout) leaf.__updateWorldMatrix()
    },

    updateBounds(leaf: ILeaf): void {
        const layout = leaf.__layout
        if (layout.boundsChanged) leaf.__updateLocalBounds()
        if (!layout.waitAutoLayout) leaf.__updateWorldBounds()
    },

    updateAllWorldOpacity(leaf: ILeaf): void {
        leaf.__updateWorldOpacity()

        if (leaf.isBranch) {
            const { children } = leaf
            for (let i = 0, len = children.length; i < len; i++) {
                updateAllWorldOpacity(children[i])
            }
        }
    },

    updateAllChange(leaf: ILeaf): void {
        updateAllWorldOpacity(leaf)

        leaf.__updateChange()

        if (leaf.isBranch) {
            const { children } = leaf
            for (let i = 0, len = children.length; i < len; i++) {
                updateAllChange(children[i])
            }
        }
    },

    worldHittable(t: ILeaf): boolean {
        while (t) {
            if (!t.__.hittable) return false
            t = t.parent
        }
        return true
    },

    // transform

    moveWorld(t: ILeaf, x: number | IPointData, y = 0, isInnerPoint?: boolean, transition?: ITransition): void {
        const local = typeof x === 'object' ? { ...x } : { x, y }
        isInnerPoint ? toOuterPoint(t.localTransform, local, local, true) : (t.parent && toInnerPoint(t.parent.worldTransform, local, local, true))
        L.moveLocal(t, local.x, local.y, transition)
    },

    moveLocal(t: ILeaf, x: number | IPointData, y = 0, transition?: ITransition): void {
        if (typeof x === 'object') y = x.y, x = x.x
        x += t.x
        y += t.y
        transition ? t.animate({ x, y }, transition) : (t.x = x, t.y = y)
    },

    zoomOfWorld(t: ILeaf, origin: IPointData, scaleX: number, scaleY?: number | ITransition, resize?: boolean, transition?: ITransition): void {
        L.zoomOfLocal(t, getTempLocal(t, origin), scaleX, scaleY, resize, transition)
    },

    zoomOfLocal(t: ILeaf, origin: IPointData, scaleX: number, scaleY: number | ITransition = scaleX, resize?: boolean, transition?: ITransition): void {
        const o = t.__localMatrix
        if (typeof scaleY !== 'number') {
            if (scaleY) transition = scaleY
            scaleY = scaleX
        }
        copy(matrix, o)
        scaleOfOuter(matrix, origin, scaleX, scaleY)
        if (t.origin || t.around) {
            L.setTransform(t, matrix, resize, transition)
        } else {
            const x = t.x + matrix.e - o.e, y = t.y + matrix.f - o.f
            if (transition && !resize) t.animate({ x, y, scaleX: t.scaleX * scaleX, scaleY: t.scaleY * scaleY }, transition)
            else t.x = x, t.y = y, t.scaleResize(scaleX, scaleY, resize !== true)
        }
    },

    rotateOfWorld(t: ILeaf, origin: IPointData, angle: number, transition?: ITransition): void {
        L.rotateOfLocal(t, getTempLocal(t, origin), angle, transition)
    },

    rotateOfLocal(t: ILeaf, origin: IPointData, angle: number, transition?: ITransition): void {
        const o = t.__localMatrix
        copy(matrix, o)
        rotateOfOuter(matrix, origin, angle)
        if (t.origin || t.around) L.setTransform(t, matrix, false, transition)
        else t.set({ x: t.x + matrix.e - o.e, y: t.y + matrix.f - o.f, rotation: MathHelper.formatRotation(t.rotation + angle) }, transition)
    },

    skewOfWorld(t: ILeaf, origin: IPointData, skewX: number, skewY?: number, resize?: boolean, transition?: ITransition): void {
        L.skewOfLocal(t, getTempLocal(t, origin), skewX, skewY, resize, transition)
    },

    skewOfLocal(t: ILeaf, origin: IPointData, skewX: number, skewY: number = 0, resize?: boolean, transition?: ITransition): void {
        copy(matrix, t.__localMatrix)
        skewOfOuter(matrix, origin, skewX, skewY)
        L.setTransform(t, matrix, resize, transition)
    },

    transformWorld(t: ILeaf, transform: IMatrixData, resize?: boolean, transition?: ITransition): void {
        copy(matrix, t.worldTransform)
        multiplyParent(matrix, transform)
        if (t.parent) divideParent(matrix, t.parent.worldTransform)
        L.setTransform(t, matrix, resize, transition)
    },

    transform(t: ILeaf, transform: IMatrixData, resize?: boolean, transition?: ITransition): void {
        copy(matrix, t.localTransform)
        multiplyParent(matrix, transform)
        L.setTransform(t, matrix, resize, transition)
    },

    setTransform(t: ILeaf, transform: IMatrixData, resize?: boolean, transition?: ITransition): void {
        const data = t.__, originPoint = data.origin && L.getInnerOrigin(t, data.origin)
        const layout = getLayout(transform, originPoint, data.around && L.getInnerOrigin(t, data.around))
        if (resize) {
            const scaleX = layout.scaleX / t.scaleX, scaleY = layout.scaleY / t.scaleY
            delete layout.scaleX, delete layout.scaleY

            if (originPoint) { // fix origin: resize 方式下 boxBounds 会变化，导致 originPoint 不准确，需偏移至正确的位置
                BoundsHelper.scale(t.boxBounds, Math.abs(scaleX), Math.abs(scaleY))
                const changedPoint = L.getInnerOrigin(t, data.origin)
                PointHelper.move(layout, originPoint.x - changedPoint.x, originPoint.y - changedPoint.y)
            }

            t.set(layout)
            t.scaleResize(scaleX, scaleY, false)

        } else t.set(layout, transition)
    },

    getFlipTransform(t: ILeaf, axis: IAxis): IMatrixData {
        const m = getMatrixData()
        const sign = axis === 'x' ? 1 : -1
        scaleOfOuter(m, L.getLocalOrigin(t, 'center'), -1 * sign, 1 * sign)
        return m
    },

    getLocalOrigin(t: ILeaf, origin: IPointData | IAlign): IPointData {
        return PointHelper.tempToOuterOf(L.getInnerOrigin(t, origin), t.localTransform)
    },

    getInnerOrigin(t: ILeaf, origin: IPointData | IAlign): IPointData {
        const innerOrigin = {} as IPointData
        AroundHelper.toPoint(origin, t.boxBounds, innerOrigin)
        return innerOrigin
    },

    getRelativeWorld(t: ILeaf, relative: ILeaf, temp?: boolean): IMatrixData {
        copy(matrix, t.worldTransform)
        divideParent(matrix, relative.worldTransform)
        return temp ? matrix : { ...matrix }
    },

    drop(t: ILeaf, parent: ILeaf, index?: number, resize?: boolean): void {
        t.setTransform(L.getRelativeWorld(t, parent, true), resize)
        parent.add(t, index)
    },

    hasParent(p: ILeaf, parent: ILeaf): boolean | void {
        if (!parent) return false
        while (p) {
            if (parent === p) return true
            p = p.parent
        }
    }

}

const L = LeafHelper
const { updateAllMatrix, updateMatrix, updateAllWorldOpacity, updateAllChange } = L

function getTempLocal(t: ILeaf, world: IPointData): IPointData {
    t.__layout.update()
    return t.parent ? PointHelper.tempToInnerOf(world, t.parent.__world) : world
}