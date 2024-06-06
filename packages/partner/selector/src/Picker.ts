import { ILeaf, ILeafList, IPointData, IRadiusPointData, IPickResult, IPickOptions, ISelector, IPickBottom } from '@leafer/interface'
import { BoundsHelper, LeafList, LeafHelper } from '@leafer/core'


const { hitRadiusPoint } = BoundsHelper

export class Picker {

    protected target: ILeaf
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
        if (!options.findList) this.hitBranch(target)  // 包含through元素

        const { list } = this.findList
        const leaf = this.getBestMatchLeaf(list, options.bottomList, ignoreHittable)
        const path = ignoreHittable ? this.getPath(leaf) : this.getHitablePath(leaf)

        this.clear()

        return through ? { path, target: leaf, throughPath: list.length ? this.getThroughPath(list) : path } : { path, target: leaf }
    }

    public getBestMatchLeaf(list: ILeaf[], bottomList: IPickBottom[], ignoreHittable: boolean): ILeaf {
        if (list.length) {
            let find: ILeaf
            this.findList = new LeafList()
            const { x, y } = this.point
            const point = { x, y, radiusX: 0, radiusY: 0 }
            for (let i = 0, len = list.length; i < len; i++) {
                find = list[i]
                if (ignoreHittable || LeafHelper.worldHittable(find)) {
                    this.hitChild(find, point)
                    if (this.findList.length) return this.findList.list[0]
                }
            }
        }

        if (bottomList) { // 底部虚拟元素
            for (let i = 0, len = bottomList.length; i < len; i++) {
                this.hitChild(bottomList[i].target, this.point, bottomList[i].proxy)
                if (this.findList.length) return this.findList.list[0]
            }
        }

        return list[0]
    }

    public getPath(leaf: ILeaf): LeafList {
        const path = new LeafList()
        while (leaf) {
            path.add(leaf)
            leaf = leaf.parent
        }
        path.add(this.target)
        return path
    }

    public getHitablePath(leaf: ILeaf): LeafList {
        const path = this.getPath(leaf && leaf.hittable ? leaf : null)
        let item: ILeaf, hittablePath = new LeafList()
        for (let i = path.list.length - 1; i > -1; i--) {
            item = path.list[i]
            if (!item.__.hittable) break
            hittablePath.addAt(item, 0)
            if (!item.__.hitChildren) break
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
                    this.eachFind(child.children, child.__onlyHitMask)
                    if (child.isBranchLeaf && !this.findList.length) this.hitChild(child, point) // like frame
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
            if (parent && parent.__hasMask && !child.__.mask && !parent.children.some(item => item.__.mask && item.__hitWorld(point))) return
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