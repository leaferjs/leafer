import { IBoundsData, IFourNumber, ILeaf } from '@leafer/interface'
import { ChildEvent } from '@leafer/event'
import { BoundsHelper } from '@leafer/math'
import { BranchHelper, LeafBoundsHelper } from '@leafer/helper'
import { useModule } from '@leafer/decorator'
import { BranchRender } from '@leafer/display-module'
import { UICreator } from '@leafer/platform'
import { isArray, isUndefined } from '@leafer/data'
import { Debug } from '@leafer/debug'

import { Leaf } from './Leaf'


const { setListWithFn } = BoundsHelper
const { sort } = BranchHelper
const { localBoxBounds, localStrokeBounds, localRenderBounds, maskLocalBoxBounds, maskLocalStrokeBounds, maskLocalRenderBounds } = LeafBoundsHelper
const debug = new Debug('Branch')

@useModule(BranchRender)
export class Branch extends Leaf { // tip: rewrited Group

    // overwrite

    public __updateStrokeSpread(): IFourNumber {
        const { children } = this
        for (let i = 0, len = children.length; i < len; i++) {
            if (children[i].__layout.strokeSpread) return 1
        }
        return 0
    }

    public __updateRenderSpread(): IFourNumber {
        const { children } = this
        for (let i = 0, len = children.length; i < len; i++) {
            if (children[i].__layout.renderSpread) return 1
        }
        return 0
    }

    public __updateBoxBounds(_secondLayout?: boolean, bounds?: IBoundsData): void {
        setListWithFn(bounds || this.__layout.boxBounds, this.children, this.__hasMask ? maskLocalBoxBounds : localBoxBounds)
    }

    public __updateStrokeBounds(bounds?: IBoundsData): void {
        setListWithFn(bounds || this.__layout.strokeBounds, this.children, this.__hasMask ? maskLocalStrokeBounds : localStrokeBounds)
    }

    public __updateRenderBounds(bounds?: IBoundsData): void {
        setListWithFn(bounds || this.__layout.renderBounds, this.children, this.__hasMask ? maskLocalRenderBounds : localRenderBounds)
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
        if (child === this || child.destroyed) return debug.warn('add self or destroyed')

        const noIndex = isUndefined(index)
        if (!child.__) {
            if (isArray(child)) return child.forEach(item => { this.add(item, index); noIndex || index++ }) // add []
            else child = UICreator.get(child.tag, child) // add JSON
        }

        if (child.parent) child.parent.remove(child)
        child.parent = this

        noIndex ? this.children.push(child) : this.children.splice(index, 0, child)
        if (child.isBranch) this.__.__childBranchNumber = (this.__.__childBranchNumber || 0) + 1

        const childLayout = child.__layout
        childLayout.boxChanged || childLayout.boxChange() // layouted(removed), need update
        childLayout.matrixChanged || childLayout.matrixChange() // layouted(removed), need update

        if (child.__bubbleMap) child.__emitLifeEvent(ChildEvent.ADD)

        if (this.leafer) {
            child.__bindLeafer(this.leafer)
            if (this.leafer.created) this.__emitChildEvent(ChildEvent.ADD, child)
        }

        this.__layout.affectChildrenSort && this.__layout.childrenSortChange()
    }

    public addMany(...children: ILeaf[]): void { this.add(children as any) }

    public remove(child?: ILeaf, destroy?: boolean): void {
        if (child) {

            if (child.__) {

                if ((child as ILeaf).animationOut) child.__runAnimation('out', () => this.__remove(child, destroy))
                else this.__remove(child, destroy)

            } else this.find(child as any).forEach(item => this.remove(item, destroy)) // 

        } else if (isUndefined(child)) {
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

    protected __remove(child?: ILeaf, destroy?: boolean): void {
        const index = this.children.indexOf(child)
        if (index > -1) {
            this.children.splice(index, 1)
            if (child.isBranch) this.__.__childBranchNumber = (this.__.__childBranchNumber || 1) - 1
            this.__preRemove()
            this.__realRemoveChild(child)
            if (destroy) child.destroy()
        }
    }

    protected __preRemove(): void {
        if (this.__hasMask) this.__updateMask()
        if (this.__hasEraser) this.__updateEraser()
        this.__layout.boxChange()
        this.__layout.affectChildrenSort && this.__layout.childrenSortChange()
    }

    protected __realRemoveChild(child: ILeaf): void {
        child.__emitLifeEvent(ChildEvent.REMOVE)
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
        if (this.hasEvent(type) && !this.isLeafer) this.emitEvent(event)
        this.leafer.emitEvent(event)
    }

}