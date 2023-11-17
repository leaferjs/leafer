import { ILeafLayout, ILeafLevelList, ILeafList } from '@leafer/interface'
import { BranchHelper, LeafHelper } from '@leafer/core'


const { updateAllMatrix, updateAllWorldOpacity } = LeafHelper
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


export function updateChange(updateList: ILeafList): void {
    updateList.list.forEach(leaf => {
        if (leaf.__layout.opacityChanged) updateAllWorldOpacity(leaf)
        leaf.__updateChange()
    })
}