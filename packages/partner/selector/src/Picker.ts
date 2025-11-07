import { ILeaf, ILeafList, IPointData, IRadiusPointData, IPickResult, IPickOptions, ISelector, IPickBottom, IPicker, ILeaferBase } from '@leafer/interface'
import { BoundsHelper, LeafList, LeafHelper } from '@leafer/core'


const { hitRadiusPoint } = BoundsHelper

export class Picker implements IPicker {

    protected target?: ILeaf
    protected selector: ISelector

    protected findList: ILeafList
    protected exclude: ILeafList

    protected point: IRadiusPointData

    constructor(target: ILeaf, selector: ISelector) {
        this.target = target
        this.selector = selector
    }

    public getByPoint(hitPoint: IPointData, hitRadius: number, options?: IPickOptions): IPickResult {
        if (!hitRadius) hitRadius = 0
        if (!options) options = {}

        const through = options.through || false
        const ignoreHittable = options.ignoreHittable || false
        const target = options.target || this.target
        this.exclude = options.exclude || null

        this.point = { x: hitPoint.x, y: hitPoint.y, radiusX: hitRadius, radiusY: hitRadius }
        this.findList = new LeafList(options.findList)

        // path
        if (!options.findList) this.hitBranch(target.isBranchLeaf ? { children: [target] } as ILeaf : target)  // 包含through元素

        const { list } = this.findList
        const leaf = this.getBestMatchLeaf(list, options.bottomList, ignoreHittable, !!options.findList)
        const path = ignoreHittable ? this.getPath(leaf) : this.getHitablePath(leaf)

        this.clear()

        return through ? { path, target: leaf, throughPath: list.length ? this.getThroughPath(list) : path } : { path, target: leaf }
    }

    public hitPoint(hitPoint: IPointData, hitRadius: number, options?: IPickOptions): boolean {
        return !!this.getByPoint(hitPoint, hitRadius, options).target // 后期需进行优化 ！！！
    }

    public getBestMatchLeaf(list: ILeaf[], bottomList: IPickBottom[], ignoreHittable: boolean, allowNull?: boolean): ILeaf {
        const findList = this.findList = new LeafList()

        if (list.length) {
            let find: ILeaf
            const { x, y } = this.point
            const point = { x, y, radiusX: 0, radiusY: 0 }
            for (let i = 0, len = list.length; i < len; i++) {
                find = list[i]
                if (ignoreHittable || LeafHelper.worldHittable(find)) {
                    this.hitChild(find, point)
                    if (findList.length) {
                        if (find.isBranchLeaf && list.some(item => item !== find && LeafHelper.hasParent(item, find))) {
                            findList.reset()
                            break // Frame / Box 同时碰撞到子元素时，忽略自身，优先选中子元素
                        }
                        return findList.list[0]
                    }
                }
            }
        }

        if (bottomList) { // 底部虚拟元素，一般为编辑器的虚拟框
            for (let i = 0, len = bottomList.length; i < len; i++) {
                this.hitChild(bottomList[i].target, this.point, bottomList[i].proxy)
                if (findList.length) return findList.list[0]
            }
        }

        if (allowNull) return null
        return ignoreHittable ? list[0] : list.find(item => LeafHelper.worldHittable(item))
    }

    public getPath(leaf: ILeaf): LeafList {
        const path = new LeafList(), syncList = [], { target } = this

        while (leaf) {
            if (leaf.syncEventer) syncList.push(leaf.syncEventer)
            path.add(leaf)
            leaf = leaf.parent
            if (leaf === target) break
        }

        // 存在同步触发
        if (syncList.length) {
            syncList.forEach(item => {
                while (item) {
                    if (item.__.hittable) path.add(item)
                    item = item.parent
                    if (item === target) break
                }
            })
        }

        if (target) path.add(target)
        return path
    }

    public getHitablePath(leaf: ILeaf): LeafList {
        const path = this.getPath(leaf && leaf.hittable ? leaf : null)
        let item: ILeaf, hittablePath = new LeafList()
        for (let i = path.list.length - 1; i > -1; i--) {
            item = path.list[i]
            if (!item.__.hittable) break
            hittablePath.addAt(item, 0)
            if (!item.__.hitChildren || (item.isLeafer && (item as ILeaferBase).mode === 'draw')) break
        }
        return hittablePath
    }

    public getThroughPath(list: ILeaf[]): LeafList {
        const throughPath = new LeafList()
        const pathList: ILeafList[] = []

        for (let i = list.length - 1; i > -1; i--) {
            pathList.push(this.getPath(list[i]))
        }

        let path: ILeafList, nextPath: ILeafList, leaf: ILeaf
        for (let i = 0, len = pathList.length; i < len; i++) {
            path = pathList[i], nextPath = pathList[i + 1]
            for (let j = 0, jLen = path.length; j < jLen; j++) {
                leaf = path.list[j]
                if (nextPath && nextPath.has(leaf)) break
                throughPath.add(leaf)
            }
        }

        return throughPath
    }

    protected hitBranch(branch: ILeaf): void {
        this.eachFind(branch.children, branch.__onlyHitMask)
    }

    protected eachFind(children: ILeaf[], hitMask: boolean): void {
        let child: ILeaf, hit: boolean
        const { point } = this, len = children.length
        for (let i = len - 1; i > -1; i--) {
            child = children[i]
            if (!child.__.visible || (hitMask && !child.__.mask)) continue
            hit = child.__.hitRadius ? true : hitRadiusPoint(child.__world, point)

            if (child.isBranch) {
                if (hit || child.__ignoreHitWorld) {
                    if (child.isBranchLeaf && child.__.__clipAfterFill && !child.__hitWorld(point)) continue // 裁剪的Box需要先检测自身是否碰撞到
                    if (child.topChildren) this.eachFind(child.topChildren, false) // 滚动条等覆盖物
                    this.eachFind(child.children, child.__onlyHitMask)
                    if (child.isBranchLeaf) this.hitChild(child, point) // Box / Frame
                }
            } else {
                if (hit) this.hitChild(child, point)
            }
        }
    }

    protected hitChild(child: ILeaf, point: IRadiusPointData, proxy?: ILeaf): void {
        if (this.exclude && this.exclude.has(child)) return
        if (child.__hitWorld(point)) {
            const { parent } = child
            if (parent && parent.__hasMask && !child.__.mask) {

                let findMasks: ILeaf[] = [], item: ILeaf
                const { children } = parent

                for (let i = 0, len = children.length; i < len; i++) {
                    item = children[i]
                    if (item.__.mask) findMasks.push(item)
                    if (item === child) {
                        if (findMasks && !findMasks.every(value => value.__hitWorld(point))) return // 遮罩上层的元素，与遮罩相交的区域才能响应事件
                        break
                    }
                }

            }
            this.findList.add(proxy || child)
        }
    }

    protected clear(): void {
        this.point = null
        this.findList = null
        this.exclude = null
    }

    public destroy(): void {
        this.clear()
    }

}