import { IAlign, ILeaf, IMatrixData, IPointData, IAxis } from '@leafer/interface'
import { MathHelper, MatrixHelper, PointHelper, AroundHelper, getMatrixData } from '@leafer/math'


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

    moveWorld(t: ILeaf, x: number | IPointData, y = 0, isInnerPoint?: boolean): void {
        const local = typeof x === 'object' ? { ...x } : { x, y }
        isInnerPoint ? toOuterPoint(t.localTransform, local, local, true) : (t.parent && toInnerPoint(t.parent.worldTransform, local, local, true))
        L.moveLocal(t, local.x, local.y)
    },

    moveLocal(t: ILeaf, x: number | IPointData, y = 0): void {
        if (typeof x === 'object') {
            t.x += x.x
            t.y += x.y
        } else {
            t.x += x
            t.y += y
        }
    },

    zoomOfWorld(t: ILeaf, origin: IPointData, scaleX: number, scaleY?: number, resize?: boolean): void {
        L.zoomOfLocal(t, getTempLocal(t, origin), scaleX, scaleY, resize)
    },

    zoomOfLocal(t: ILeaf, origin: IPointData, scaleX: number, scaleY: number = scaleX, resize?: boolean): void {
        copy(matrix, t.__localMatrix)
        scaleOfOuter(matrix, origin, scaleX, scaleY)
        if (t.origin || t.around) {
            L.setTransform(t, matrix, resize)
        } else {
            moveByMatrix(t, matrix)
            t.scaleResize(scaleX, scaleY, resize !== true)
        }
    },

    rotateOfWorld(t: ILeaf, origin: IPointData, angle: number): void {
        L.rotateOfLocal(t, getTempLocal(t, origin), angle)
    },

    rotateOfLocal(t: ILeaf, origin: IPointData, angle: number): void {
        copy(matrix, t.__localMatrix)
        rotateOfOuter(matrix, origin, angle)
        if (t.origin || t.around) {
            L.setTransform(t, matrix)
        } else {
            moveByMatrix(t, matrix)
            t.rotation = MathHelper.formatRotation(t.rotation + angle)
        }
    },

    skewOfWorld(t: ILeaf, origin: IPointData, skewX: number, skewY?: number, resize?: boolean): void {
        L.skewOfLocal(t, getTempLocal(t, origin), skewX, skewY, resize)
    },

    skewOfLocal(t: ILeaf, origin: IPointData, skewX: number, skewY: number = 0, resize?: boolean): void {
        copy(matrix, t.__localMatrix)
        skewOfOuter(matrix, origin, skewX, skewY)
        L.setTransform(t, matrix, resize)
    },

    transformWorld(t: ILeaf, transform: IMatrixData, resize?: boolean): void {
        copy(matrix, t.worldTransform)
        multiplyParent(matrix, transform)
        if (t.parent) divideParent(matrix, t.parent.worldTransform)
        L.setTransform(t, matrix, resize)
    },

    transform(t: ILeaf, transform: IMatrixData, resize?: boolean): void {
        copy(matrix, t.localTransform)
        multiplyParent(matrix, transform)
        L.setTransform(t, matrix, resize)
    },

    setTransform(t: ILeaf, transform: IMatrixData, resize?: boolean): void {
        const layout = getLayout(transform, t.origin && L.getInnerOrigin(t, t.origin), t.around && L.getInnerOrigin(t, t.around))
        if (resize) {
            const scaleX = layout.scaleX / t.scaleX
            const scaleY = layout.scaleY / t.scaleY
            delete layout.scaleX
            delete layout.scaleY
            t.set(layout)
            t.scaleResize(scaleX, scaleY, resize !== true)
        } else {
            t.set(layout)
        }
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

function moveByMatrix(t: ILeaf, matrix: IMatrixData): void {
    const { e, f } = t.__localMatrix
    t.x += matrix.e - e
    t.y += matrix.f - f
}

function getTempLocal(t: ILeaf, world: IPointData): IPointData {
    t.__layout.update()
    return t.parent ? PointHelper.tempToInnerOf(world, t.parent.__world) : world
}