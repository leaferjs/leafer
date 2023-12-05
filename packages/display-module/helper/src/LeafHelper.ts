import { ILeaf, IMatrixData, IPointData } from '@leafer/interface'
import { MathHelper, MatrixHelper, PointHelper } from '@leafer/math'


const { copy, toInnerPoint, scaleOfOuter, rotateOfOuter, skewOfOuter, multiplyParent, divideParent, getLayout } = MatrixHelper
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

    moveWorld(t: ILeaf, x: number, y: number): void {
        const local = { x, y }
        if (t.parent) toInnerPoint(t.parent.worldTransform, local, local, true)
        L.moveLocal(t, local.x, local.y)
    },

    moveLocal(t: ILeaf, x: number, y: number = 0): void {
        t.x += x
        t.y += y
    },

    zoomOfWorld(t: ILeaf, origin: IPointData, scaleX: number, scaleY?: number, resize?: boolean): void {
        this.zoomOfLocal(t, getTempLocal(t, origin), scaleX, scaleY, resize)
    },

    zoomOfLocal(t: ILeaf, origin: IPointData, scaleX: number, scaleY: number = scaleX, resize?: boolean): void {
        copy(matrix, t.__localMatrix)
        scaleOfOuter(matrix, origin, scaleX, scaleY)
        moveByMatrix(t, matrix)
        t.scaleResize(scaleX, scaleY, resize !== true)
    },

    rotateOfWorld(t: ILeaf, origin: IPointData, angle: number): void {
        this.rotateOfLocal(t, getTempLocal(t, origin), angle)
    },

    rotateOfLocal(t: ILeaf, origin: IPointData, angle: number): void {
        copy(matrix, t.__localMatrix)
        rotateOfOuter(matrix, origin, angle)
        moveByMatrix(t, matrix)
        t.rotation = MathHelper.formatRotation(t.rotation + angle)
    },

    skewOfWorld(t: ILeaf, origin: IPointData, skewX: number, skewY?: number, resize?: boolean): void {
        this.skewOfLocal(t, getTempLocal(t, origin), skewX, skewY, resize)
    },

    skewOfLocal(t: ILeaf, origin: IPointData, skewX: number, skewY: number = 0, resize?: boolean): void {
        copy(matrix, t.__localMatrix)
        skewOfOuter(matrix, origin, skewX, skewY)
        L.setTransform(t, matrix, resize)
    },

    transform(t: ILeaf, transform: IMatrixData, resize?: boolean): void {
        copy(matrix, t.localTransform)
        multiplyParent(matrix, transform)
        L.setTransform(t, matrix, resize)
    },

    setTransform(t: ILeaf, transform: IMatrixData, resize?: boolean): void {
        const layout = getLayout(transform)
        if (resize) {
            t.scaleResize(layout.scaleX / t.scaleX, layout.scaleY / t.scaleY, resize !== true)
            delete layout.scaleX
            delete layout.scaleY
        }
        t.set(layout)
    },


    drop(t: ILeaf, parent: ILeaf, index?: number, resize?: boolean): void {
        copy(matrix, t.worldTransform)
        divideParent(matrix, parent.worldTransform)
        t.setTransform(matrix, resize)
        parent.add(t, index)
    },

    hasParent(p: ILeaf, parent: ILeaf): boolean | void {
        if (!parent) return false
        while (p) {
            if (parent === p) return true
            p = p.parent
        }
    },

    hasParentAutoLayout(p: ILeaf): boolean | void {
        while (p.parent) {
            p = p.parent
            if (p.__hasAutoLayout) return true
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