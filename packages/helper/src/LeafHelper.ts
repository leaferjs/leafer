import { ILeaf, IPointData } from '@leafer/interface'
import { Matrix, MatrixHelper, PointHelper } from '@leafer/math'


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

    moveOfWorld(t: ILeaf, worldX: number, worldY: number): void {
        const local = { x: worldX, y: worldY }
        if (t.parent) MatrixHelper.toLocalPoint(t.parent.__world, local, local, true)
        L.move(t, local.x, local.y)
    },

    move(t: ILeaf, x: number, y: number): void {
        t.x = t.__.x + x
        t.y = t.__.y + y
    },

    zoomOfWorld(t: ILeaf, scale: number, worldCenter: IPointData, moveLayer?: ILeaf): void {
        const local = t.parent ? PointHelper.tempToLocal(worldCenter, t.parent.__world) : worldCenter
        this.zoom(t, scale, local, moveLayer)
    },

    zoom(t: ILeaf, scale: number, localCenter: IPointData, moveLayer?: ILeaf): void {
        if (!moveLayer) moveLayer = t
        const { x, y } = moveLayer.__
        const { scaleX, scaleY } = t.__
        const centerX = localCenter.x - x
        const centerY = localCenter.y - y
        const matrix = new Matrix().translate(centerX, centerY).scale(scale).translate(-centerX, -centerY)
        moveLayer.x = x - matrix.e
        moveLayer.y = y - matrix.f
        t.scaleX = scaleX * scale
        t.scaleY = scaleY * scale
    },

    rotateOfWorld(t: ILeaf, angle: number, worldCenter: IPointData, moveLayer?: ILeaf): void {
        const local = t.parent ? PointHelper.tempToLocal(worldCenter, t.parent.__world) : worldCenter
        this.rotate(t, angle, local, moveLayer)
    },

    rotate(t: ILeaf, angle: number, localCenter: IPointData, moveLayer?: ILeaf): void {
        if (!moveLayer) moveLayer = t
        const { x, y } = moveLayer.__
        const { rotation } = t.__
        const centerX = localCenter.x - x
        const centerY = localCenter.y - y
        const matrix = new Matrix().translate(centerX, centerY).rotate(angle).translate(-centerX, -centerY)
        moveLayer.x = x - matrix.e
        moveLayer.y = y - matrix.f
        t.rotation = rotation + angle
    }

}
const L = LeafHelper
const { updateAllWorldMatrix, updateAllWorldOpacity, updateAllChange } = L