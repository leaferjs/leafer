import { ILeaf, ILeaferCanvas, IRenderOptions } from '@leafer/interface'
import { ChildEvent } from '@leafer/event'
import { BoundsHelper } from '@leafer/math'
import { BranchHelper, LeafBoundsHelper } from '@leafer/helper'

import { Leaf } from './Leaf'


const { setByListWithHandle } = BoundsHelper
const { sort } = BranchHelper
const { relativeBoxBounds: localBoxBounds, relativeEventBounds: localEventBounds, relativeRenderBounds: localRenderBounds } = LeafBoundsHelper

export class Branch extends Leaf {

    constructor() {
        super()
        this.__isBranch = true
        this.children = []
    }

    // overwrite

    public __updateEventBoundsSpreadWidth(): number {
        const { children } = this
        for (let i = 0, len = children.length; i < len; i++) {
            if (children[i].__layout.eventBoundsSpreadWidth) return 1
        }
        return 0
    }

    public __updateRenderBoundsSpreadWidth(): number {
        const { children } = this
        for (let i = 0, len = children.length; i < len; i++) {
            if (children[i].__layout.renderBoundsSpreadWidth) return 1
        }
        return 0
    }


    public __updateBoxBounds(): void {
        setByListWithHandle(this.__layout.boxBounds, this.children, localBoxBounds)
    }

    public __updateEventBounds(): void {
        setByListWithHandle(this.__layout.eventBounds, this.children, localEventBounds)
    }

    public __updateRenderBounds(): void {
        setByListWithHandle(this.__layout.renderBounds, this.children, localRenderBounds)
    }

    public __updateChange(): void {
        const { __layout: layout } = this
        if (layout.childrenSortChanged) {
            this.__updateSortChildren()
            layout.childrenSortChanged = false
        }
    }


    // own

    public __updateSortChildren(): void {
        const { children } = this
        if (children.length > 1) {
            for (let i = 0, len = children.length; i < len; i++) {
                children[i].__tempNumber = i
            }
            children.sort(sort)
        }
    }

    public __render(canvas: ILeaferCanvas, options: IRenderOptions): void {

        if (this.__worldOpacity) {
            let child: ILeaf
            const { bounds, hideBounds } = options, { children } = this
            for (let i = 0, len = children.length; i < len; i++) {
                child = children[i]
                if (bounds && !bounds.hit(child.__world, options.matrix)) continue
                if (hideBounds && hideBounds.includes(child.__world)) continue
                child.__render(canvas, options)
            }
        }

    }

    public add(child: ILeaf, index?: number): void {

        if (child.parent) {
            if (child.parent !== this) console.warn('child had other parent, can not add to this, child innerId:' + child.innerId)
            return
        }

        child.parent = this

        index === undefined ? this.children.push(child) : this.children.splice(index, 0, child)
        if (child.__isBranch) this.__.__childBranchNumber ? this.__.__childBranchNumber++ : this.__.__childBranchNumber = 1

        if (this.root) {
            child.__bindRoot(this.root)

            const event = new ChildEvent(ChildEvent.ADD, child, this)
            if (this.hasEvent(ChildEvent.ADD)) this.emitEvent(event)
            this.root.emitEvent(event)
        }

        if (child.__parentWait) child.__runParentWait()
    }

    public remove(child?: Leaf): void {

        if (child) {
            const index = this.children.indexOf(child)
            if (index > -1) {
                this.children.splice(index, 1)

                if (child.__isBranch) this.__.__childBranchNumber > 1 ? this.__.__childBranchNumber-- : this.__.__childBranchNumber = 0

                if (this.root) {
                    const event = new ChildEvent(ChildEvent.REMOVE, child, this)
                    if (this.hasEvent(ChildEvent.REMOVE)) this.emitEvent(event)
                    this.root.emitEvent(event)
                    child.root = null
                }

                child.parent = null
                this.__layout.boxBoundsChange()
            }
        } else {
            if (this.parent) this.parent.remove(this)
        }

    }
}


