import { IBranch, ILeaf, IMatrixData, IPointData } from '@leafer/interface'
import { MatrixHelper, PointHelper } from '@leafer/math'


const { copy, translate, toInnerPoint, scaleOfOuter, rotateOfOuter } = MatrixHelper
const matrix = {} as IMatrixData

export const LeafHelper = {

    updateAllWorldMatrix(leaf: ILeaf): void {
        leaf.__updateWorldMatrix()

        if (leaf.isBranch) {
            const { children } = leaf
            for (let i = 0, len = children.length; i < len; i++) {
                updateAllWorldMatrix(children[i])
            }
        }
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
        if (t.parent) toInnerPoint(t.parent.__world, local, local, true)
        L.moveLocal(t, local.x, local.y)
    },

    moveLocal(t: ILeaf, x: number, y: number = 0): void {
        t.x += x
        t.y += y
    },

    zoomOfWorld(t: ILeaf, origin: IPointData, scaleX: number, scaleY?: number, moveLayer?: ILeaf): void {
        const local = t.parent ? PointHelper.tempToInnerOf(origin, t.parent.__world) : origin
        this.zoomOfLocal(t, local, scaleX, scaleY, moveLayer)
    },

    zoomOfLocal(t: ILeaf, origin: IPointData, scaleX: number, scaleY: number = scaleX, moveLayer?: ILeaf): void {
        copy(matrix, t.__local)
        if (moveLayer) translate(matrix, moveLayer.x, moveLayer.y)
        scaleOfOuter(matrix, origin, scaleX, scaleY)
        if (!moveLayer) moveLayer = t
        moveLayer.x += matrix.e - t.__local.e
        moveLayer.y += matrix.f - t.__local.f
        t.scaleX *= scaleX
        t.scaleY *= scaleY
    },

    rotateOfWorld(t: ILeaf, origin: IPointData, angle: number, moveLayer?: ILeaf): void {
        const local = t.parent ? PointHelper.tempToInnerOf(origin, t.parent.__world) : origin
        this.rotateOfLocal(t, local, angle, moveLayer)
    },

    rotateOfLocal(t: ILeaf, origin: IPointData, angle: number, moveLayer?: ILeaf): void {
        copy(matrix, t.__local)
        if (moveLayer) translate(matrix, moveLayer.x, moveLayer.y)
        rotateOfOuter(matrix, origin, angle)
        if (!moveLayer) moveLayer = t
        moveLayer.x += matrix.e - t.__local.e
        moveLayer.y += matrix.f - t.__local.f
        t.rotation += angle
    },

    drop(t: ILeaf, parent: IBranch): void {
        const position = { x: t.x, y: t.y }
        t.localToWorld(position)
        parent.worldToInner(position)
        t.set(position)
        parent.add(t)
    }

}
const L = LeafHelper
const { updateAllWorldMatrix, updateAllWorldOpacity, updateAllChange } = L