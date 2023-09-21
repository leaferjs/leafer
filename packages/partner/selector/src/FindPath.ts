import { ILeaf, ILeafList, IPointData, IRadiusPointData, ISelectPathResult, ISelectPathOptions, ISelector } from '@leafer/interface'
import { BoundsHelper, LeafList, LeafHelper } from '@leafer/core'


const { hitRadiusPoint } = BoundsHelper

export class FindPath {

    protected target: ILeaf
    protected selector: ISelector

    protected findList: ILeaf[]
    protected exclude: ILeafList

    protected point: IRadiusPointData

    constructor(target: ILeaf, selector: ISelector) {
        this.target = target
        this.selector = selector
    }

    public getByPoint(hitPoint: IPointData, hitRadius: number, options?: ISelectPathOptions): ISelectPathResult {
        if (!hitRadius) hitRadius = 0
        if (!options) options = {}

        const through = options.through || false
        const ignoreHittable = options.ignoreHittable || false
        this.exclude = options.exclude || null

        this.point = { x: hitPoint.x, y: hitPoint.y, radiusX: hitRadius, radiusY: hitRadius }
        this.findList = []

        // path
        this.eachFind(this.target.children, this.target.__onlyHitMask)

        const list = this.findList
        const leaf = this.getBestMatchLeaf()
        const path = ignoreHittable ? this.getPath(leaf) : this.getHitablePath(leaf)

        this.clear()

        return through ? { path, leaf, throughPath: list.length ? this.getThroughPath(list) : path } : { path, leaf }
    }

    public getBestMatchLeaf(): ILeaf {
        const { findList: targets } = this
        if (targets.length > 1) {
            let find: ILeaf
            this.findList = []
            const { x, y } = this.point
            const point = { x, y, radiusX: 0, radiusY: 0 }
            for (let i = 0, len = targets.length; i < len; i++) {
                find = targets[i]
                if (LeafHelper.worldHittable(find)) {
                    this.hitChild(find, point)
                    if (this.findList.length) return this.findList[0]
                }
            }
        }
        return targets[0]
    }

    public getPath(leaf: ILeaf): LeafList {
        const path = new LeafList()
        while (leaf) {
            path.push(leaf)
            leaf = leaf.parent
        }
        path.push(this.target)
        return path
    }

    public getHitablePath(leaf: ILeaf): LeafList {
        const path = this.getPath(leaf)
        let item: ILeaf, hittablePath = new LeafList()
        for (let i = path.list.length - 1; i > -1; i--) {
            item = path.list[i]
            if (!item.__.hittable) break
            hittablePath.unshift(item)
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
                throughPath.push(leaf)
            }
        }

        return throughPath
    }


    protected eachFind(children: Array<ILeaf>, hitMask: boolean): void {
        let child: ILeaf, hit: boolean
        const { point } = this, len = children.length
        for (let i = len - 1; i > -1; i--) {
            child = children[i]
            if (!child.__.visible || (hitMask && !child.__.isMask)) continue
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

    protected hitChild(child: ILeaf, point: IRadiusPointData): void {
        if (this.exclude && this.exclude.has(child)) return
        if (child.__hitWorld(point)) this.findList.push(child)
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