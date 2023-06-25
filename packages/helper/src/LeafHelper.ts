import { IBranch, ILeaf, IPointData } from '@leafer/interface'
import { Matrix, MatrixHelper, PointHelper } from '@leafer/math'


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


    // transform

    move(t: ILeaf, x: number, y: number): void {
        const local = { x, y }
        if (t.parent) MatrixHelper.toInnerPoint(t.parent.__world, local, local, true)
        L.moveLocal(t, local.x, local.y)
    },

    moveLocal(t: ILeaf, x: number, y: number): void {
        t.x = t.__.x + x
        t.y = t.__.y + y
    },

    zoomOf(t: ILeaf, center: IPointData, scaleX: number, scaleY?: number, moveLayer?: ILeaf): void {
        const local = t.parent ? PointHelper.tempToInnerOf(center, t.parent.__world) : center
        this.zoomOfLocal(t, local, scaleX, scaleY, moveLayer)
    },

    zoomOfLocal(t: ILeaf, center: IPointData, scaleX: number, scaleY?: number, moveLayer?: ILeaf): void {
        if (!scaleY) scaleY = scaleX
        if (!moveLayer) moveLayer = t
        const { x, y } = moveLayer.__
        const matrix = new Matrix().translate(x, y).scaleOf(center, scaleX, scaleY)
        moveLayer.x = matrix.e
        moveLayer.y = matrix.f
        t.scaleX = t.__.scaleX * scaleX
        t.scaleY = t.__.scaleY * scaleY
    },

    rotateOf(t: ILeaf, center: IPointData, angle: number, moveLayer?: ILeaf): void {
        const local = t.parent ? PointHelper.tempToInnerOf(center, t.parent.__world) : center
        this.rotateOfLocal(t, local, angle, moveLayer)
    },

    rotateOfLocal(t: ILeaf, center: IPointData, angle: number, moveLayer?: ILeaf): void {
        if (!moveLayer) moveLayer = t
        const { x, y } = moveLayer.__
        const matrix = new Matrix().translate(x, y).rotateOf(center, angle)
        moveLayer.x = matrix.e
        moveLayer.y = matrix.f
        t.rotation = t.__.rotation + angle
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