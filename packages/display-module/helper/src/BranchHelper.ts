import { ILeaf, ILeafLevelList, ILeafList, IMatrixWithBoundsData, IMatrixWithBoundsScaleData } from '@leafer/interface'
import { isUndefined } from '@leafer/data'
import { LeafHelper } from './LeafHelper'

const { updateBounds } = LeafHelper

export const BranchHelper = {

    sort(a: ILeaf, b: ILeaf): number {
        return (a.__.zIndex === b.__.zIndex) ? (a.__tempNumber - b.__tempNumber) : (a.__.zIndex - b.__.zIndex)
    },

    // push

    pushAllChildBranch(branch: ILeaf, leafList: ILeafList | ILeafLevelList): void {
        branch.__tempNumber = 1   // 标识需要更新子Leaf元素的WorldBounds分支 Layouter需使用

        if (branch.__.__childBranchNumber) {
            const { children } = branch
            for (let i = 0, len = children.length; i < len; i++) {
                branch = children[i]
                if (branch.isBranch) {
                    branch.__tempNumber = 1
                    leafList.add(branch)
                    pushAllChildBranch(branch, leafList)
                }
            }
        }
    },

    pushAllParent(leaf: ILeaf, leafList: ILeafList | ILeafLevelList): void {
        const { keys } = (leafList as ILeafList)
        if (keys) {
            while (leaf.parent) {
                if (isUndefined(keys[leaf.parent.innerId])) {
                    leafList.add(leaf.parent)
                    leaf = leaf.parent
                } else {
                    break
                }
            }
        } else {
            while (leaf.parent) {
                leafList.add(leaf.parent)
                leaf = leaf.parent
            }
        }
    },

    pushAllBranchStack(branch: ILeaf, pushList: ILeaf[]): void {
        let start = pushList.length
        const { children } = branch
        for (let i = 0, len = children.length; i < len; i++) {
            if (children[i].isBranch) {
                pushList.push(children[i])
            }
        }

        // 找子级
        for (let i = start, len = pushList.length; i < len; i++) {
            pushAllBranchStack(pushList[i], pushList)
        }
    },

    updateBounds(branch: ILeaf, exclude?: ILeaf): void {
        const branchStack: ILeaf[] = [branch]
        pushAllBranchStack(branch, branchStack)
        updateBoundsByBranchStack(branchStack, exclude)
    },

    updateBoundsByBranchStack(branchStack: ILeaf[], exclude?: ILeaf): void {
        let branch: ILeaf, children: ILeaf[]
        for (let i = branchStack.length - 1; i > -1; i--) {
            branch = branchStack[i]
            children = branch.children
            for (let j = 0, len = children.length; j < len; j++) {
                updateBounds(children[j])
            }
            if (exclude && exclude === branch) continue
            updateBounds(branch)
        }
    },

    move(branch: ILeaf, x: number, y: number): void {
        let w: IMatrixWithBoundsData
        const { children } = branch
        for (let i = 0, len = children.length; i < len; i++) {
            branch = children[i]
            w = branch.__world

            w.e += x
            w.f += y
            w.x += x
            w.y += y

            if (branch.isBranch) move(branch, x, y)
        }
    },

    scale(branch: ILeaf, x: number, y: number, scaleX: number, scaleY: number, a: number, b: number): void {
        let w: IMatrixWithBoundsScaleData
        const { children } = branch
        const changeScaleX = scaleX - 1
        const changeScaleY = scaleY - 1

        for (let i = 0, len = children.length; i < len; i++) {
            branch = children[i]
            w = branch.__world

            w.a *= scaleX
            w.d *= scaleY

            if (w.b || w.c) {
                w.b *= scaleX
                w.c *= scaleY
            }

            if (w.e === w.x && w.f === w.y) {
                w.x = w.e += (w.e - a) * changeScaleX + x
                w.y = w.f += (w.f - b) * changeScaleY + y
            } else {
                w.e += (w.e - a) * changeScaleX + x
                w.f += (w.f - b) * changeScaleY + y

                w.x += (w.x - a) * changeScaleX + x
                w.y += (w.y - b) * changeScaleY + y
            }

            w.width *= scaleX
            w.height *= scaleY

            w.scaleX *= scaleX
            w.scaleY *= scaleY

            if (branch.isBranch) scale(branch, x, y, scaleX, scaleY, a, b)
        }
    }
}

const { pushAllChildBranch, pushAllBranchStack, updateBoundsByBranchStack, move, scale } = BranchHelper