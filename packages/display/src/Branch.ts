import { ILeaf } from '@leafer/interface'
import { ChildEvent } from '@leafer/event'
import { BoundsHelper } from '@leafer/math'
import { BranchHelper, LeafBoundsHelper, WaitHelper } from '@leafer/helper'
import { useModule } from '@leafer/decorator'
import { BranchRender, LeafMask } from '@leafer/display-module'

import { Leaf } from './Leaf'


const { setByListWithHandle } = BoundsHelper
const { sort } = BranchHelper
const { localBoxBounds, localEventBounds, localRenderBounds, maskLocalBoxBounds, maskLocalEventBounds, maskLocalRenderBounds } = LeafBoundsHelper


@useModule(BranchRender)
@useModule(LeafMask)
export class Branch extends Leaf {

    constructor() {
        super()
        this.isBranch = true
        this.children = []
    }

    // overwrite

    public __updateStrokeSpread(): number {
        const { children } = this
        for (let i = 0, len = children.length; i < len; i++) {
            if (children[i].__layout.strokeSpread) return 1
        }
        return 0
    }

    public __updateRenderSpread(): number {
        const { children } = this
        for (let i = 0, len = children.length; i < len; i++) {
            if (children[i].__layout.renderSpread) return 1
        }
        return 0
    }

    public __updateBoxBounds(): void {
        setByListWithHandle(this.__layout.boxBounds, this.children, this.__hasMask ? maskLocalBoxBounds : localBoxBounds)
    }

    public __updateStrokeBounds(): void {
        setByListWithHandle(this.__layout.strokeBounds, this.children, this.__hasMask ? maskLocalEventBounds : localEventBounds)
    }

    public __updateRenderBounds(): void {
        setByListWithHandle(this.__layout.renderBounds, this.children, this.__hasMask ? maskLocalRenderBounds : localRenderBounds)
    }


    // own

    public __updateSortChildren(): void {
        let affectSort: boolean
        const { children } = this
        if (children.length > 1) {
            for (let i = 0, len = children.length; i < len; i++) {
                children[i].__tempNumber = i
                if (children[i].__.zIndex) affectSort = true
            }
            children.sort(sort)
            this.__layout.affectChildrenSort = affectSort
        }
    }

    public add(child: ILeaf, index?: number): void {
        if (child.parent) child.parent.remove(child)
        child.parent = this

        index === undefined ? this.children.push(child) : this.children.splice(index, 0, child)
        if (child.isBranch) this.__.__childBranchNumber = (this.__.__childBranchNumber || 0) + 1
        child.__layout.boundsChanged || child.__layout.positionChange() // layouted(removed), need update

        if (child.__parentWait) WaitHelper.run(child.__parentWait)

        if (this.leafer) {
            child.__bindLeafer(this.leafer)
            if (this.leafer.ready) this.__emitChildEvent(ChildEvent.ADD, child)
        }

        this.__layout.affectChildrenSort && this.__layout.childrenSortChange()
    }

    public addMany(...children: ILeaf[]): void {
        children.forEach(child => this.add(child))
    }

    public remove(child?: Leaf, destroy?: boolean): void {
        if (child) {
            const index = this.children.indexOf(child)
            if (index > -1) {
                this.children.splice(index, 1)
                if (child.isBranch) this.__.__childBranchNumber = (this.__.__childBranchNumber || 1) - 1
                this.__preRemove()
                this.__realRemoveChild(child)
                if (destroy) child.destroy()
            }
        } else if (child === undefined) {
            super.remove(null, destroy)
        }
    }

    public removeAll(destroy?: boolean): void {
        const { children } = this
        if (children.length) {
            this.children = []
            this.__preRemove()
            this.__.__childBranchNumber = 0
            children.forEach(child => {
                this.__realRemoveChild(child)
                if (destroy) child.destroy()
            })
        }
    }

    protected __preRemove(): void {
        if (this.__hasMask) this.__updateMask()
        if (this.__hasEraser) this.__updateEraser()
        this.__layout.boxChange()
        this.__layout.affectChildrenSort && this.__layout.childrenSortChange()
    }

    protected __realRemoveChild(child: ILeaf): void {
        child.parent = null
        if (this.leafer) {
            child.__bindLeafer(null)
            if (this.leafer.ready) this.__emitChildEvent(ChildEvent.REMOVE, child)
            this.leafer.hitCanvasManager.clear()
        }
    }

    protected __emitChildEvent(type: string, child: ILeaf): void {
        const event = new ChildEvent(type, child, this)
        if (child.hasEvent(type)) child.emitEvent(event)
        if (this.hasEvent(type) && !this.isLeafer) this.emitEvent(event)
        this.leafer.emitEvent(event)
    }
}