import { Matrix, MatrixHelper, PointHelper } from '@leafer/math'
import { ILeaf, IPointData } from '@leafer/interface'


export const LeafHelper = {

    updateAllWorldMatrix(leaf: ILeaf): void {
        leaf.__updateWorldMatrix()

        if (leaf.__isBranch) {
            const { children } = leaf
            for (let i = 0, len = children.length; i < len; i++) {
                updateAllWorldMatrix(children[i])
            }
        }
    },

    updateAllWorldOpacity(leaf: ILeaf): void {
        leaf.__updateWorldOpacity()

        if (leaf.__isBranch) {
            const { children } = leaf
            for (let i = 0, len = children.length; i < len; i++) {
                updateAllWorldOpacity(children[i])
            }
        }
    },

    updateAllChange(leaf: ILeaf): void {

        updateAllWorldOpacity(leaf)

        leaf.__updateChange()

        if (leaf.__isBranch) {
            const { children } = leaf
            for (let i = 0, len = children.length; i < len; i++) {
                updateAllChange(children[i])
            }
        }
    },


    // transform

    moveByWorld(t: ILeaf, worldX: number, worldY: number): void {
        const local = { x: worldX, y: worldY }
        if (t.parent) MatrixHelper.toLocalPoint(t.parent.__world, local, local, true)
        L.move(t, local.x, local.y)
    },

    move(t: ILeaf, x: number, y: number): void {
        t.x = t.__.x + x
        t.y = t.__.y + y
    },

    zoomByWorld(t: ILeaf, scale: number, world: IPointData, moveLayer?: ILeaf): void {
        const local = t.parent ? PointHelper.tempToLocal(world, t.parent.__world) : world
        this.zoom(t, scale, local, moveLayer)
    },

    zoom(t: ILeaf, scale: number, local: IPointData, moveLayer?: ILeaf): void {
        if (!moveLayer) moveLayer = t
        const { x, y } = moveLayer.__
        const { scaleX, scaleY } = t.__
        const centerX = local.x - x
        const centerY = local.y - y
        const matrix = new Matrix().translate(centerX, centerY).scale(scale).translate(-centerX, -centerY)
        moveLayer.x = x - matrix.e
        moveLayer.y = y - matrix.f
        t.scaleX = scaleX * scale
        t.scaleY = scaleY * scale
    },

    rotateByWorld(t: ILeaf, angle: number, world: IPointData, moveLayer?: ILeaf): void {
        const local = t.parent ? PointHelper.tempToLocal(world, t.parent.__world) : world
        this.rotate(t, angle, local, moveLayer)
    },

    rotate(t: ILeaf, angle: number, local: IPointData, moveLayer?: ILeaf): void {
        if (!moveLayer) moveLayer = t
        const { x, y } = moveLayer.__
        const { rotation } = t.__
        const centerX = local.x - x
        const centerY = local.y - y
        const matrix = new Matrix().translate(centerX, centerY).rotate(angle).translate(-centerX, -centerY)
        moveLayer.x = x - matrix.e
        moveLayer.y = y - matrix.f
        t.rotation = rotation + angle
    }

}
const L = LeafHelper
const { updateAllWorldMatrix, updateAllWorldOpacity, updateAllChange } = L