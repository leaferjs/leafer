import { ILeaf } from '@leafer/interface'
import { ChildEvent } from '@leafer/event'
import { BoundsHelper } from '@leafer/math'
import { BranchHelper, LeafBoundsHelper, WaitHelper } from '@leafer/helper'
import { useModule } from '@leafer/decorator'
import { BranchRender } from '@leafer/display-module'

import { Leaf } from './Leaf'


const { setListWithFn } = BoundsHelper
const { sort } = BranchHelper
const { localBoxBounds, localStrokeBounds, localRenderBounds, maskLocalBoxBounds, maskLocalStrokeBounds, maskLocalRenderBounds } = LeafBoundsHelper


@useModule(BranchRender)
export class Branch extends Leaf { // tip: rewrited Group

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
        setListWithFn(this.__layout.boxBounds, this.children, this.__hasMask ? maskLocalBoxBounds : localBoxBounds)
    }

    public __updateStrokeBounds(): void {
        setListWithFn(this.__layout.strokeBounds, this.children, this.__hasMask ? maskLocalStrokeBounds : localStrokeBounds)
    }

    public __updateRenderBounds(): void {
        setListWithFn(this.__layout.renderBounds, this.children, this.__hasMask ? maskLocalRenderBounds : localRenderBounds)
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
        if (child === this) return

        if (child.parent) child.parent.remove(child)
        child.parent = this

        index === undefined ? this.children.push(child) : this.children.splice(index, 0, child)
        if (child.isBranch) this.__.__childBranchNumber = (this.__.__childBranchNumber || 0) + 1

        child.__layout.boxChanged || child.__layout.boxChange() // layouted(removed), need update
        child.__layout.matrixChanged || child.__layout.matrixChange() // layouted(removed), need update

        if (child.__parentWait) WaitHelper.run(child.__parentWait)

        if (this.leafer) {
            child.__bindLeafer(this.leafer)
            if (this.leafer.created) this.__emitChildEvent(ChildEvent.ADD, child)
        }

        this.__layout.affectChildrenSort && this.__layout.childrenSortChange()
    }

    public addMany(...children: ILeaf[]): void {
        children.forEach(child => this.add(child))
    }

    public remove(child?: ILeaf, destroy?: boolean): void {
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

    public clear(): void {
        this.removeAll(true)
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
            if (this.leafer.created) {
                this.__emitChildEvent(ChildEvent.REMOVE, child)
                if (this.leafer.hitCanvasManager) this.leafer.hitCanvasManager.clear()
            }
        }
    }

    protected __emitChildEvent(type: string, child: ILeaf): void {
        const event = new ChildEvent(type, child, this)
        if (child.hasEvent(type)) child.emitEvent(event)
        if (this.hasEvent(type) && !this.isLeafer) this.emitEvent(event)
        this.leafer.emitEvent(event)
    }

}