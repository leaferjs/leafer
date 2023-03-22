import { ILeaf, ILeafList } from '@leafer/interface'


interface ILeafPushList {
    push(item: ILeaf): void
}


export const BranchHelper = {

    sort(a: ILeaf, b: ILeaf): number {
        return (a.__.zIndex === b.__.zIndex) ? (a.__tempNumber - b.__tempNumber) : (a.__.zIndex - b.__.zIndex)
    },

    // push

    pushAllChildBranch(branch: ILeaf, pushList: ILeafPushList): void {
        branch.__tempNumber = 1   // 标识需要更新子Leaf元素的WorldBounds分支 Layouter需使用

        if (branch.__.__childBranchNumber) {
            const { children } = branch
            for (let i = 0, len = children.length; i < len; i++) {
                branch = children[i]
                if (branch.__isBranch) {
                    branch.__tempNumber = 1
                    pushList.push(branch)
                    pushAllChildBranch(branch, pushList)
                }
            }
        }
    },

    pushAllParent(leaf: ILeaf, pushList: ILeafPushList): void {
        const { keys } = (pushList as ILeafList)
        if (keys) {
            while (leaf.parent) {
                if (keys[leaf.parent.innerId] === undefined) {
                    pushList.push(leaf.parent)
                    leaf = leaf.parent
                } else {
                    break
                }
            }
        } else {
            while (leaf.parent) {
                pushList.push(leaf.parent)
                leaf = leaf.parent
            }
        }
    },

    pushAllBranchStack(branch: ILeaf, pushList: ILeaf[]): void {
        let start = pushList.length
        const { children } = branch
        for (let i = 0, len = children.length; i < len; i++) {
            if (children[i].__isBranch) {
                pushList.push(children[i])
            }
        }

        // 找子级
        for (let i = start, len = pushList.length; i < len; i++) {
            pushAllBranchStack(pushList[i], pushList)
        }
    },

    updateWorldBoundsByBranchStack(branchStack: ILeaf[]): void {
        let branch: ILeaf
        for (let i = branchStack.length - 1; i > -1; i--) {
            branch = branchStack[i]
            for (let j = 0, len = branch.children.length; j < len; j++) {
                branch.children[j].__updateWorldBounds()
            }
        }
        branch.__updateWorldBounds()
    }
}

const { pushAllChildBranch, pushAllBranchStack } = BranchHelper