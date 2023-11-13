import { IBranch, ILeaf, IMatrixData, IPointData } from '@leafer/interface'
import { MathHelper, MatrixHelper, PointHelper } from '@leafer/math'


const { copy, toInnerPoint, scaleOfOuter, rotateOfOuter, skewOfOuter, multiplyParent, getLayout } = MatrixHelper
const matrix = {} as IMatrixData

export const LeafHelper = {

    updateAllWorldMatrix(leaf: ILeaf): void {
        updateWorldMatrix(leaf)

        if (leaf.isBranch) {
            const { children } = leaf
            for (let i = 0, len = children.length; i < len; i++) {
                updateAllWorldMatrix(children[i])
            }
        }
    },

    updateWorldMatrix(leaf: ILeaf): void {
        if (leaf.__layout.matrixChanged) leaf.__updateLocalMatrix(), leaf.__layout.matrixChanged = false
        leaf.__updateWorldMatrix()
    },

    updateWorldBounds(leaf: ILeaf): void {
        if (leaf.__layout.boundsChanged) leaf.__updateLocalBounds(), leaf.__layout.boundsChanged = false
        leaf.__updateWorldBounds()
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
        if (!t.__.hittable) return false
        let { parent } = t
        while (parent) {
            if (!parent.__.hittable || !parent.__.hitChildren) return false
            parent = parent.parent
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
        t.scaleWith(scaleX, scaleY, resize)
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
            const { scaleX, scaleY } = layout
            t.scaleWith(scaleX / t.scaleX, scaleY / t.scaleY, resize)
            delete layout.scaleX
            delete layout.scaleY
        }
        t.set(layout)
    },


    drop(t: ILeaf, parent: IBranch): void {
        const position = { x: t.x, y: t.y }
        t.localToWorld(position)
        parent.worldToInner(position)
        t.set(position)
        parent.add(t)
    },

    hasParent(t: ILeaf, parent: ILeaf): boolean {
        if (!parent) return false
        let p = t
        while (p) {
            if (parent === p) return true
            p = p.parent
        }
        return false
    }

}

const L = LeafHelper
const { updateAllWorldMatrix, updateWorldMatrix, updateAllWorldOpacity, updateAllChange } = L

function moveByMatrix(t: ILeaf, matrix: IMatrixData): void {
    const { e, f } = t.__localMatrix
    t.x += matrix.e - e
    t.y += matrix.f - f
}

function getTempLocal(t: ILeaf, world: IPointData): IPointData {
    t.__layout.update()
    return t.parent ? PointHelper.tempToInnerOf(world, t.parent.__world) : world
}