import { ILeaf, IMatrixData, IPointData, ILeafLevelList } from '@leafer/interface'
import { MathHelper, MatrixHelper, PointHelper } from '@leafer/math'


const { copy, toInnerPoint, scaleOfOuter, rotateOfOuter, skewOfOuter, multiplyParent, divideParent, getLayout } = MatrixHelper
const matrix = {} as IMatrixData

export const LeafHelper = {

    updateAllMatrix(leaf: ILeaf, checkAutoLayout?: boolean, hasAutoLayout?: boolean): void {
        if (checkAutoLayout && leaf.__layout.matrixChanged) {
            if (!hasAutoLayout) hasAutoLayout = leaf.__hasAutoLayout
        }

        updateMatrix(leaf, checkAutoLayout, hasAutoLayout)

        if (leaf.isBranch) {
            const { children } = leaf
            for (let i = 0, len = children.length; i < len; i++) {
                updateAllMatrix(children[i], checkAutoLayout, hasAutoLayout)
            }
        }
    },

    updateMatrix(leaf: ILeaf, checkAutoLayout?: boolean, hasAutoLayout?: boolean): void {
        const layout = leaf.__layout

        if (checkAutoLayout) {
            if (hasAutoLayout) layout.waitAutoLayout++
        } else {
            if (layout.waitAutoLayout) layout.waitAutoLayout--
        }

        if (layout.waitAutoLayout) {
            if (layout.matrixChanged) {
                (checkAutoLayout && leaf.__hasAutoLayout) ? (layout.matrixChanged = false) : leaf.__updateLocalMatrix()
            }
        } else {
            if (layout.matrixChanged) leaf.__updateLocalMatrix()
            leaf.__updateWorldMatrix()
        }
    },

    updateBoundsList(boundsList: ILeafLevelList, exclude?: ILeaf): void {
        let itemList: ILeaf[], branch: ILeaf, children: ILeaf[]
        boundsList.sort(true)
        boundsList.levels.forEach(level => {
            itemList = boundsList.levelMap[level]
            for (let i = 0, len = itemList.length; i < len; i++) {
                branch = itemList[i]

                // 标识了需要更新子元素
                if (branch.isBranch && branch.__tempNumber) {
                    children = branch.children
                    for (let j = 0, jLen = children.length; j < jLen; j++) {
                        if (!children[j].isBranch) {
                            updateBounds(children[j])
                        }
                    }
                }

                if (exclude && exclude === branch) continue
                updateBounds(branch)
            }
        })
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
            const { scaleX, scaleY } = layout
            t.scaleResize(scaleX / t.scaleX, scaleY / t.scaleY, resize !== true)
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
const { updateAllMatrix, updateMatrix, updateBounds, updateAllWorldOpacity, updateAllChange } = L

function moveByMatrix(t: ILeaf, matrix: IMatrixData): void {
    const { e, f } = t.__localMatrix
    t.x += matrix.e - e
    t.y += matrix.f - f
}

function getTempLocal(t: ILeaf, world: IPointData): IPointData {
    t.__layout.update()
    return t.parent ? PointHelper.tempToInnerOf(world, t.parent.__world) : world
}