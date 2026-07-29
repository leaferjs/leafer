import { ILeafLayout, ILeafLevelList, ILeafList, ILeaf } from '@leafer/interface'
import { BranchHelper, LeafHelper } from '@leafer/core'


const { updateAllMatrix, updateBounds: updateOneBounds, updateChange: updateOneChange } = LeafHelper
const { pushAllChildBranch, pushAllParent } = BranchHelper

export const LayouterHelper = {

    // 更新矩阵, 所有子元素，和父元素都需要更新bounds
    updateMatrix(updateList: ILeafList, levelList: ILeafLevelList): void {
        let index = 0, leaf: ILeaf, layout: ILeafLayout
        const { list } = updateList

        while (index < list.length) { // 允许中间添加新的元素进来
            leaf = list[index]
            layout = leaf.__layout
            if (levelList.without(leaf) && !layout.proxyZoom) { // 防止重复， 子元素可能已经被父元素更新过

                if (layout.matrixChanged) {

                    updateAllMatrix(leaf, true)

                    if (leaf.isBranch) pushAllChildBranch(leaf, levelList)
                    push(leaf, levelList)

                } else if (layout.boundsChanged) {

                    if (leaf.isBranch) leaf.__tempNumber = 0  // 标识需要更新子Leaf元素的WorldBounds分支, 0表示不需要更新
                    push(leaf, levelList)

                }
            }
            index++
        }
    },

    updateBounds(boundsList: ILeafLevelList): void {
        let index = 0, level: number, list: ILeaf[], branch: ILeaf, children: ILeaf[]
        const { levels, levelMap } = boundsList

        boundsList.sort(true)

        while (index < levels.length) { // 允许中间添加新的元素进来
            level = levels[index]
            list = levelMap[level]
            for (let i = 0, len = list.length; i < len; i++) {
                branch = list[i]

                // 标识了需要更新子元素
                if (branch.isBranch && branch.__tempNumber) {
                    children = branch.children
                    for (let j = 0, jLen = children.length; j < jLen; j++) {
                        if (!children[j].isBranch) {
                            updateOneBounds(children[j])
                        }
                    }
                }
                updateOneBounds(branch)
            }
            index++
        }
    },

    updateChange(updateList: ILeafList): void {
        updateList.list.forEach(updateOneChange)
    },

    push

}

function push(leaf: ILeaf, levelList: ILeafLevelList): void {
    levelList.add(leaf)
    pushAllParent(leaf, levelList)
}