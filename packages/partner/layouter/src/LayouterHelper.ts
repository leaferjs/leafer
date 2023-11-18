import { ILeafLayout, ILeafLevelList, ILeafList, ILeaf } from '@leafer/interface'
import { BranchHelper, LeafHelper } from '@leafer/core'


const { updateAllMatrix, updateBounds: updateOneBounds, updateAllWorldOpacity } = LeafHelper
const { pushAllChildBranch, pushAllParent } = BranchHelper


export function updateMatrix(updateList: ILeafList, levelList: ILeafLevelList): void {

    let layout: ILeafLayout
    updateList.list.forEach(leaf => {  // 更新矩阵, 所有子元素，和父元素都需要更新bounds
        layout = leaf.__layout
        if (levelList.without(leaf) && !layout.proxyZoom) { // 防止重复， 子元素可能已经被父元素更新过

            if (layout.matrixChanged) {

                updateAllMatrix(leaf, true)

                levelList.add(leaf)
                if (leaf.isBranch) pushAllChildBranch(leaf, levelList)
                pushAllParent(leaf, levelList)

            } else if (layout.boundsChanged) {

                levelList.add(leaf)
                if (leaf.isBranch) leaf.__tempNumber = 0  // 标识需要更新子Leaf元素的WorldBounds分支, 0表示不需要更新
                pushAllParent(leaf, levelList)
            }
        }
    })

}

export function updateBounds(boundsList: ILeafLevelList): void {
    let list: ILeaf[], branch: ILeaf, children: ILeaf[]
    boundsList.sort(true)
    boundsList.levels.forEach(level => {
        list = boundsList.levelMap[level]
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
    })
}


export function updateChange(updateList: ILeafList): void {
    updateList.list.forEach(leaf => {
        if (leaf.__layout.opacityChanged) updateAllWorldOpacity(leaf)
        leaf.__updateChange()
    })
}