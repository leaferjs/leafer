import { ILeaf, ILeafList, IPointData, IRadiusPointData, ISelectPathResult, ISelectPathOptions, ISelector } from '@leafer/interface'
import { BoundsHelper } from '@leafer/math'
import { LeafList } from '@leafer/list'

const { hitRadiusPoint } = BoundsHelper


export class PathFinder {

    protected target: ILeaf
    protected selector: ISelector

    protected leaf?: ILeaf
    protected throughPath: ILeafList
    protected exclude: ILeafList

    protected point: IRadiusPointData
    protected isStop: boolean

    constructor(target: ILeaf, selector: ISelector) {
        this.target = target
        this.selector = selector
    }

    public getHitPointPath(hitPoint: IPointData, hitRadius: number, options?: ISelectPathOptions): ISelectPathResult {
        const through = options ? options.through : false
        this.exclude = options ? options.exclude : null

        this.isStop = false
        this.point = { x: hitPoint.x, y: hitPoint.y, radiusX: hitRadius, radiusY: hitRadius }

        // path
        this.eachFind(this.target.children)

        const { leaf } = this
        const { defaultPath } = this.selector
        const path = this.getPath(leaf)
        path.pushList(defaultPath.list)

        let result: ISelectPathResult

        // throughPath
        if (through) {
            const throughPath = this.throughPath = new LeafList()
            this.eachThroughFind(this.target.children)
            throughPath.pushList(defaultPath.list)
            result = { path, leaf, throughPath }
        } else {
            result = { path, leaf }
        }

        this.clear()

        return result

    }

    public getPath(leaf: ILeaf): LeafList {
        const list: LeafList = new LeafList()
        while (leaf) {
            list.push(leaf)
            leaf = leaf.parent
        }
        return list
    }

    protected eachThroughFind(children: Array<ILeaf>): void {
        let child: ILeaf
        const { point } = this, len = children.length
        for (let i = len - 1; i > -1; i--) {
            child = children[i]
            if (child.__interactionOff) continue

            if (hitRadiusPoint(child.__world, point)) {
                if (child.__isBranch) {
                    child.__childrenInteractionOff || this.eachThroughFind(child.children)
                }

                if (this.exclude && this.exclude.has(child)) continue
                if (child.__hitWorld(point)) this.throughPath.push(child)
            }

        }
    }

    protected eachFind(children: Array<ILeaf>): void {
        let child: ILeaf
        const { point } = this, len = children.length
        for (let i = len - 1; i > -1; i--) {
            child = children[i]
            if (child.__interactionOff) continue

            if (hitRadiusPoint(child.__world, point)) {
                if (child.__isBranch) {

                    child.__childrenInteractionOff || this.eachFind(child.children)

                    if (child.__isBranchLeaf) { // 填充了背景色的Group, 如画板/Frame元素
                        if (!this.isStop) this.hitChild(child, point)
                    }

                } else {
                    this.hitChild(child, point)
                }
            }

            if (this.isStop) break
        }
    }

    protected hitChild(child: ILeaf, point: IRadiusPointData): void {
        if (this.exclude && this.exclude.has(child)) return
        if (child.__hitWorld(point)) {
            this.leaf = child
            this.isStop = true
        }
    }

    protected clear(): void {
        this.point = null
        this.leaf = null
        this.throughPath = null
        this.exclude = null
    }

    public destroy(): void {
        this.target = null
        this.selector = null
    }

}