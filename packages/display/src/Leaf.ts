import { ILeafer, ILeaf, ILeafInputData, ILeafData, ILeaferCanvas, IRenderOptions, IMatrixWithBoundsData, __Number, __Boolean, __Value, ILeafLayout, InnerId, IHitCanvas, IRadiusPointData, IEventListenerMap, IEventListener, IEventListenerOptions, IEventListenerId, IEvent, IObject, IFunction, __String, IPointData, IMatrixDecompositionAttr, ILayoutBoundsType, ILayoutLocationType, IBoundsData, IMatrixData } from '@leafer/interface'
import { IncrementId, MatrixHelper, PointHelper } from '@leafer/math'
import { LeafData } from '@leafer/data'
import { LeafLayout } from '@leafer/layout'
import { LeafDataProxy, LeafMatrix, LeafBounds, LeafHit, LeafEventer, LeafRender } from '@leafer/display-module'
import { useModule } from '@leafer/decorator'
import { LeafHelper, WaitHelper } from '@leafer/helper'


const { LEAF, create } = IncrementId

@useModule(LeafDataProxy)
@useModule(LeafMatrix)
@useModule(LeafBounds)
@useModule(LeafHit)
@useModule(LeafEventer)
@useModule(LeafRender)
export class Leaf implements ILeaf {

    public get tag(): string { return this.__tag }
    public set tag(_value: string) { }

    public get __tag(): string { return 'Leaf' }

    public readonly innerId: InnerId  // 内部唯一标识
    public get innerName(): string { return this.__.name || this.tag + this.innerId }

    public get __DataProcessor() { return LeafData }
    public get __LayoutProcessor() { return LeafLayout }

    public leafer?: ILeafer
    public parent?: ILeaf

    public isLeafer: boolean
    public isBranch: boolean
    public isBranchLeaf: boolean

    public __: ILeafData
    public __layout: ILeafLayout

    public __local: IMatrixWithBoundsData
    public __world: IMatrixWithBoundsData
    public __worldOpacity: number

    // now transform
    public get worldTransform(): IMatrixData { return this.__layout.getTransform('world') }
    public get localTransform(): IMatrixData { return this.__layout.getTransform('local') }

    // now bounds
    public get worldBoxBounds(): IBoundsData { return this.getBounds('box') }
    public get worldStrokeBounds(): IBoundsData { return this.getBounds('stroke') }
    public get worldRenderBounds(): IBoundsData { return this.getBounds('render') }

    // now opacity
    public get worldOpacity(): number { this.__layout.checkUpdate(); return this.__worldOpacity }

    public __level: number // layer level  0 -> branch -> branch -> deep
    public __tempNumber: number // temp sort

    public __hasMask?: boolean
    public __hasEraser?: boolean
    public __hitCanvas?: IHitCanvas

    public get __onlyHitMask(): boolean { return this.__hasMask && !this.__.hitChildren }
    public get __ignoreHitWorld(): boolean { return (this.__hasMask || this.__hasEraser) && this.__.hitChildren }

    // event
    public __captureMap?: IEventListenerMap
    public __bubbleMap?: IEventListenerMap

    public __parentWait?: IFunction[]
    public __leaferWait?: IFunction[]

    // branch 
    public children?: ILeaf[]

    constructor(data?: ILeafInputData) {

        this.innerId = create(LEAF)

        this.__local = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0, x: 0, y: 0, width: 0, height: 0 }
        this.__world = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0, x: 0, y: 0, width: 0, height: 0 }

        this.__worldOpacity = 1

        this.__ = new this.__DataProcessor(this)
        this.__layout = new this.__LayoutProcessor(this)

        if (data) Object.assign(this, data)
    }


    public waitParent(item: IFunction): void {
        this.parent ? item() : (this.__parentWait ? this.__parentWait.push(item) : this.__parentWait = [item])
    }

    public waitLeafer(item: IFunction): void {
        this.leafer ? item() : (this.__leaferWait ? this.__leaferWait.push(item) : this.__leaferWait = [item])
    }


    public __bindLeafer(leafer: ILeafer | null): void {
        if (this.isLeafer) leafer = this as unknown as ILeafer

        this.leafer = leafer
        this.__level = this.parent ? this.parent.__level + 1 : 1

        if (this.__leaferWait && leafer) WaitHelper.run(this.__leaferWait)

        if (this.isBranch) {
            const { children } = this
            for (let i = 0, len = children.length; i < len; i++) {
                children[i].__bindLeafer(leafer)
            }
        }
    }

    public set(_data: IObject): void { }

    public get(_attrNames?: string[]): IObject { return undefined }


    // LeafDataProxy rewrite

    public __setAttr(_attrName: string, _newValue: __Value): void { }

    public __getAttr(_attrName: string): __Value { return undefined }

    // ---

    public forceUpdate(attrName?: string): void {
        if (!attrName) attrName = 'x'
        const value = this.__.__get(attrName)
        this.__[attrName] = (value === null) ? 0 : null;
        (this as any)[attrName] = value
    }


    // LeafMatrix rewrite

    public __updateWorldMatrix(): void { }

    public __updateLocalMatrix(): void { }

    // ---

    // LeafBounds rewrite

    public __updateWorldBounds(): void { }


    public __updateLocalBoxBounds(): void { }

    public __updateLocalStrokeBounds(): void { }

    public __updateLocalRenderBounds(): void { }

    // box

    public __updateBoxBounds(): void { }

    public __updateStrokeBounds(): void { }

    public __updateRenderBounds(): void { }


    public __updateStrokeSpread(): number { return 0 }

    public __updateRenderSpread(): number { return 0 }

    public __onUpdateSize(): void { }

    // ---


    // LeafMask rewrite

    public __updateEraser(_value?: boolean): void { }

    public __updateMask(_value?: boolean): void { }

    public __renderMask(_canvas: ILeaferCanvas, _content: ILeaferCanvas, _mask: ILeaferCanvas): void { }

    public __removeMask(_child?: ILeaf): void { }

    // ---


    // convert

    public getWorld(attrName: IMatrixDecompositionAttr): number {
        return this.__layout.decomposeTransform('world')[attrName]
    }

    public getBounds(type: ILayoutBoundsType, locationType: ILayoutLocationType = 'world'): IBoundsData {
        return this.__layout.getBounds(type, locationType)
    }


    public worldToLocal(world: IPointData, to?: IPointData, isMovePoint?: boolean): void {
        if (this.parent) {
            MatrixHelper.toInnerPoint(this.parent.worldTransform, world, to, isMovePoint)
        } else {
            if (to) PointHelper.copy(to, world)
        }
    }

    public localToWorld(local: IPointData, to?: IPointData, isMovePoint?: boolean): void {
        if (this.parent) {
            MatrixHelper.toOuterPoint(this.parent.worldTransform, local, to, isMovePoint)
        } else {
            if (to) PointHelper.copy(to, local)
        }
    }

    public worldToInner(world: IPointData, to?: IPointData, isMovePoint?: boolean): void {
        MatrixHelper.toInnerPoint(this.worldTransform, world, to, isMovePoint)
    }

    public innerToWorld(inner: IPointData, to?: IPointData, isMovePoint?: boolean): void {
        MatrixHelper.toOuterPoint(this.worldTransform, inner, to, isMovePoint)
    }


    // transform

    public move(x: number, y?: number): void {
        LeafHelper.moveLocal(this, x, y)
    }

    public scaleOf(origin: IPointData, x: number, y?: number): void {
        if (this.__layout.matrixChanged) this.__updateLocalMatrix()
        if (y === undefined) y = x
        LeafHelper.zoomOfLocal(this, PointHelper.tempToOuterOf(origin, this.__local), x, y)
    }

    public rotateOf(origin: IPointData, angle: number): void {
        if (this.__layout.matrixChanged) this.__updateLocalMatrix()
        LeafHelper.rotateOfLocal(this, PointHelper.tempToOuterOf(origin, this.__local), angle)
    }


    // LeafHit rewrite

    public __hitWorld(_point: IRadiusPointData): boolean { return true }

    public __hit(_local: IRadiusPointData): boolean { return true }

    public __drawHitPath(_canvas: ILeaferCanvas): void { }

    public __updateHitCanvas(): void { }

    // ---


    // LeafRender rewrite

    public __render(_canvas: ILeaferCanvas, _options: IRenderOptions): void { }

    public __drawFast(_canvas: ILeaferCanvas, _options: IRenderOptions): void { }

    public __draw(_canvas: ILeaferCanvas, _options: IRenderOptions): void { }

    public __renderShape(_canvas: ILeaferCanvas, _options: IRenderOptions): void { }


    public __updateWorldOpacity(): void { }

    public __updateChange(): void { }

    // ---


    // path

    public __drawPath(_canvas: ILeaferCanvas): void { }

    public __drawRenderPath(_canvas: ILeaferCanvas): void { }

    public __updatePath(): void { }

    public __updateRenderPath(): void { }


    // Branch rewrite

    public __updateSortChildren(): void { }

    public add(_child: ILeaf, _index?: number): void { }

    public remove(_child?: ILeaf): void {
        if (this.parent) this.parent.remove(this)
    }

    // ---


    // LeafEventer rewrite

    public on(_type: string | string[], _listener: IEventListener, _options?: IEventListenerOptions | boolean): void { }

    public off(_type: string | string[], _listener: IEventListener, _options?: IEventListenerOptions | boolean): void { }

    public on_(_type: string | string[], _listener: IEventListener, _bind?: IObject, _options?: IEventListenerOptions | boolean): IEventListenerId { return undefined }

    public off_(_id: IEventListenerId | IEventListenerId[]): void { }

    public once(_type: string | string[], _listener: IEventListener, _capture?: boolean): void { }

    public emit(_type: string, _event?: IEvent | IObject, _capture?: boolean): void { }

    public emitEvent(_event?: IEvent, _capture?: boolean): void { }

    public hasEvent(_type: string, _capture?: boolean): boolean { return false }

    // ---

    public destroy(): void {
        if (this.__) {
            if (this.__hitCanvas) {
                this.__hitCanvas.destroy()
                this.__hitCanvas = null
            }

            this.leafer = null
            this.parent = null

            this.__.destroy()
            this.__layout.destroy()
            this.__ = null
            this.__layout = null

            this.__captureMap = null
            this.__bubbleMap = null

            if (this.children) {
                this.children.forEach(child => { child.destroy() })
                this.children.length = 0
            }
        }
    }

}
