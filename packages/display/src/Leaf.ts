import { ILeaferBase, ILeaf, ILeafInputData, ILeafData, ILeaferCanvas, IRenderOptions, IBoundsType, ILocationType, IMatrixWithBoundsData, ILayoutBoundsData, IValue, ILeafLayout, InnerId, IHitCanvas, IRadiusPointData, IEventListenerMap, IEventListener, IEventListenerOptions, IEventListenerId, IEvent, IObject, IFunction, IPointData, IBoundsData, IBranch, IFindMethod, ILayoutAttr, IMatrixData, IAttrDecorator, IMatrixWithBoundsScaleData, IMatrixWithScaleData } from '@leafer/interface'
import { BoundsHelper, IncrementId, MatrixHelper, PointHelper } from '@leafer/math'
import { LeafData } from '@leafer/data'
import { LeafLayout } from '@leafer/layout'
import { LeafDataProxy, LeafMatrix, LeafBounds, LeafEventer, LeafRender } from '@leafer/display-module'
import { boundsType, useModule, defineDataProcessor } from '@leafer/decorator'
import { LeafHelper, WaitHelper } from '@leafer/helper'
import { ChildEvent } from '@leafer/event'


const { LEAF, create } = IncrementId
const { toInnerPoint, toOuterPoint, multiplyParent } = MatrixHelper
const { toOuterOf } = BoundsHelper
const { tempToOuterOf, copy } = PointHelper
const { moveLocal, zoomOfLocal, rotateOfLocal, skewOfLocal, moveWorld, zoomOfWorld, rotateOfWorld, skewOfWorld, transform, transformWorld, setTransform, getRelativeWorld, drop } = LeafHelper

@useModule(LeafDataProxy)
@useModule(LeafMatrix)
@useModule(LeafBounds)
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

    public leafer?: ILeaferBase
    public parent?: ILeaf

    public get isLeafer(): boolean { return false }
    public get isBranch(): boolean { return false }
    public get isBranchLeaf(): boolean { return false }

    public __: ILeafData
    public __layout: ILeafLayout

    public __world: IMatrixWithBoundsScaleData
    public __local?: IMatrixWithBoundsData // and localStrokeBounds? localRenderBounds?

    public __nowWorld?: IMatrixWithBoundsScaleData // use __world or __cameraWorld render
    public __cameraWorld?: IMatrixWithBoundsScaleData // use camera matrix render  

    public get __localMatrix(): IMatrixData { return this.__local || this.__layout }
    public get __localBoxBounds(): IBoundsData { return this.__local || this.__layout }

    public __worldOpacity: number

    // now transform
    public get worldTransform(): IMatrixWithScaleData { return this.__layout.getTransform('world') as IMatrixWithScaleData }
    public get localTransform(): IMatrixData { return this.__layout.getTransform('local') }

    // now bounds
    public get boxBounds(): IBoundsData { return this.getBounds('box', 'inner') }
    public get renderBounds(): IBoundsData { return this.getBounds('render', 'inner') }
    public get worldBoxBounds(): IBoundsData { return this.getBounds('box') }
    public get worldStrokeBounds(): IBoundsData { return this.getBounds('stroke') }
    public get worldRenderBounds(): IBoundsData { return this.getBounds('render') }

    // now opacity
    public get worldOpacity(): number { this.__layout.update(); return this.__worldOpacity }

    public __level: number // layer level  0 -> branch -> branch -> deep
    public __tempNumber: number // temp sort

    public get __worldFlipped(): boolean { return this.__world.scaleX < 0 || this.__world.scaleY < 0 }

    public __hasAutoLayout?: boolean
    public __hasMask?: boolean
    public __hasEraser?: boolean
    public __hitCanvas?: IHitCanvas

    public get __onlyHitMask(): boolean { return this.__hasMask && !this.__.hitChildren }
    public get __ignoreHitWorld(): boolean { return (this.__hasMask || this.__hasEraser) && this.__.hitChildren }

    public get pathInputed(): boolean { return !!this.__.__pathInputed }

    // event
    public __captureMap?: IEventListenerMap
    public __bubbleMap?: IEventListenerMap

    public __parentWait?: IFunction[]
    public __leaferWait?: IFunction[]

    // branch 
    public children?: ILeaf[]

    // other
    public noBounds?: boolean

    public destroyed: boolean


    constructor(data?: ILeafInputData) {
        this.innerId = create(LEAF)
        this.reset(data)
    }


    public reset(data?: ILeafInputData): void {

        this.__world = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0, x: 0, y: 0, width: 0, height: 0, scaleX: 1, scaleY: 1 }
        if (data !== null) this.__local = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0, x: 0, y: 0, width: 0, height: 0 }

        this.__worldOpacity = 1

        this.__ = new this.__DataProcessor(this)
        this.__layout = new this.__LayoutProcessor(this)

        if (this.__level) this.resetCustom()
        if (data) {
            if ((data as ILeaf).__) data = (data as ILeaf).toJSON()
            data.children ? this.set(data) : Object.assign(this, data)
        }
    }

    public resetCustom(): void {
        this.__hasMask = this.__hasEraser = null
        this.forceUpdate()
    }


    public waitParent(item: IFunction, bind?: IObject): void {
        if (bind) item = item.bind(bind)
        this.parent ? item() : (this.__parentWait ? this.__parentWait.push(item) : this.__parentWait = [item])
    }

    public waitLeafer(item: IFunction, bind?: IObject): void {
        if (bind) item = item.bind(bind)
        this.leafer ? item() : (this.__leaferWait ? this.__leaferWait.push(item) : this.__leaferWait = [item])
    }

    public nextRender(item: IFunction, bind?: IObject, off?: 'off'): void {
        this.leafer ? this.leafer.nextRender(item, bind, off) : this.waitLeafer(() => this.leafer.nextRender(item, bind, off))
    }

    public removeNextRender(item: IFunction): void {
        this.nextRender(item, null, 'off')
    }

    public __bindLeafer(leafer: ILeaferBase | null): void {
        if (this.isLeafer) {
            if (leafer !== null) leafer = this as unknown as ILeaferBase
        }

        if (this.leafer && !leafer) this.leafer.leafs--

        this.leafer = leafer

        if (leafer) {
            leafer.leafs++
            this.__level = this.parent ? this.parent.__level + 1 : 1
            if (this.__leaferWait) WaitHelper.run(this.__leaferWait)
        }

        if (this.isBranch) {
            const { children } = this
            for (let i = 0, len = children.length; i < len; i++) {
                children[i].__bindLeafer(leafer)
            }
        }
    }

    // data

    public set(_data: IObject): void { }
    public get(_name?: string): ILeafInputData | IValue { return undefined }

    public toJSON(): IObject {
        return this.__.__getInputData()
    }

    public toString(): string {
        return JSON.stringify(this.toJSON())
    }

    // LeafDataProxy rewrite

    public __setAttr(_attrName: string, _newValue: IValue): boolean { return true }

    public __getAttr(_attrName: string): IValue { return undefined }

    public setProxyAttr(_attrName: string, _newValue: IValue): void { }

    public getProxyAttr(_attrName: string): IValue { return undefined }

    // ---


    // find

    public find(_condition: number | string | IFindMethod, _options?: any): ILeaf[] { return undefined }

    public findOne(_condition: number | string | IFindMethod, _options?: any): ILeaf { return undefined }

    // ---


    // state

    public focus(_value?: boolean): void { }

    // ---


    public forceUpdate(attrName?: string): void {
        if (attrName === undefined) attrName = 'width'
        else if (attrName === 'surface') attrName = 'blendMode'
        const value = this.__.__getInput(attrName);
        (this.__ as any)[attrName] = value === undefined ? null : undefined;
        (this as any)[attrName] = value
    }

    public updateLayout(): void {
        this.__layout.update()
    }


    // LeafMatrix rewrite

    public __updateWorldMatrix(): void { }

    public __updateLocalMatrix(): void { }

    // ---

    // LeafBounds rewrite

    public __updateWorldBounds(): void { }

    public __updateLocalBounds(): void { }


    public __updateLocalBoxBounds(): void { }

    public __updateLocalStrokeBounds(): void { }

    public __updateLocalRenderBounds(): void { }

    // box

    public __updateBoxBounds(): void { }

    public __updateContentBounds(): void { }

    public __updateStrokeBounds(): void { }

    public __updateRenderBounds(): void { }


    public __updateAutoLayout(): void { }

    public __updateFlowLayout(): void { }

    public __updateNaturalSize(): void { }


    public __updateStrokeSpread(): number { return 0 }

    public __updateRenderSpread(): number { return 0 }

    public __onUpdateSize(): void { }

    // ---


    // LeafMask rewrite

    public __updateEraser(value?: boolean): void {
        this.__hasEraser = value ? true : this.children.some(item => item.__.eraser)
    }

    public __updateMask(value?: boolean): void {
        this.__hasMask = value ? true : this.children.some(item => item.__.mask)
    }

    public __renderMask(_canvas: ILeaferCanvas, _options: IRenderOptions): void { }

    public __renderEraser(canvas: ILeaferCanvas, options: IRenderOptions): void {  // path eraser
        canvas.save()
        this.__clip(canvas, options)
        const { renderBounds: r } = this.__layout
        canvas.clearRect(r.x, r.y, r.width, r.height)
        canvas.restore()
    }


    // ---


    // convert

    public __getNowWorld(options: IRenderOptions): IMatrixWithBoundsScaleData {
        if (options.matrix) {
            if (!this.__cameraWorld) this.__cameraWorld = {} as IMatrixWithBoundsScaleData
            const cameraWorld = this.__cameraWorld
            multiplyParent(this.__world, options.matrix, cameraWorld, undefined, this.__world)
            toOuterOf(this.__layout.renderBounds, cameraWorld, cameraWorld)
            return cameraWorld
        } else {
            return this.__world
        }
    }


    public getWorld(attrName: ILayoutAttr): number {
        this.__layout.update()
        if (attrName === 'x') return this.__world.e
        if (attrName === 'y') return this.__world.f
        return this.getLayoutBounds()[attrName]
    }

    public getTransform(relative?: ILocationType | ILeaf): IMatrixData {
        return this.__layout.getTransform(relative || 'local')
    }


    public getBounds(type?: IBoundsType, relative?: ILocationType | ILeaf): IBoundsData {
        return this.__layout.getBounds(type, relative)
    }

    public getLayoutBounds(type?: IBoundsType, relative?: ILocationType | ILeaf, unscale?: boolean): ILayoutBoundsData {
        return this.__layout.getLayoutBounds(type, relative, unscale)
    }

    public getLayoutPoints(type?: IBoundsType, relative?: ILocationType | ILeaf): IPointData[] {
        return this.__layout.getLayoutPoints(type, relative)
    }


    public getWorldBounds(inner: IBoundsData, relative?: ILeaf, change?: boolean): IBoundsData {
        const matrix = relative ? getRelativeWorld(this, relative) : this.worldTransform
        const to = change ? inner : {} as IBoundsData
        toOuterOf(inner, matrix, to)
        return to
    }


    public worldToLocal(world: IPointData, to?: IPointData, distance?: boolean, relative?: ILeaf): void {
        if (this.parent) {
            this.parent.worldToInner(world, to, distance, relative)
        } else {
            if (to) copy(to, world)
        }
    }

    public localToWorld(local: IPointData, to?: IPointData, distance?: boolean, relative?: ILeaf): void {
        if (this.parent) {
            this.parent.innerToWorld(local, to, distance, relative)
        } else {
            if (to) copy(to, local)
        }
    }

    public worldToInner(world: IPointData, to?: IPointData, distance?: boolean, relative?: ILeaf): void {
        if (relative) {
            relative.innerToWorld(world, to, distance)
            world = to ? to : world
        }
        toInnerPoint(this.worldTransform, world, to, distance)
    }

    public innerToWorld(inner: IPointData, to?: IPointData, distance?: boolean, relative?: ILeaf): void {
        toOuterPoint(this.worldTransform, inner, to, distance)
        if (relative) relative.worldToInner(to ? to : inner, null, distance)
    }

    // simple

    public getInnerPoint(world: IPointData, relative?: ILeaf, distance?: boolean, change?: boolean): IPointData {
        const point = change ? world : {} as IPointData
        this.worldToInner(world, point, distance, relative)
        return point
    }

    public getInnerPointByLocal(local: IPointData, _relative?: ILeaf, distance?: boolean, change?: boolean): IPointData {
        return this.getInnerPoint(local, this.parent, distance, change)
    }

    public getLocalPoint(world: IPointData, relative?: ILeaf, distance?: boolean, change?: boolean): IPointData {
        const point = change ? world : {} as IPointData
        this.worldToLocal(world, point, distance, relative)
        return point
    }

    public getLocalPointByInner(inner: IPointData, _relative?: ILeaf, distance?: boolean, change?: boolean): IPointData {
        return this.getWorldPoint(inner, this.parent, distance, change)
    }

    public getWorldPoint(inner: IPointData, relative?: ILeaf, distance?: boolean, change?: boolean): IPointData {
        const point = change ? inner : {} as IPointData
        this.innerToWorld(inner, point, distance, relative)
        return point
    }

    public getWorldPointByLocal(local: IPointData, relative?: ILeaf, distance?: boolean, change?: boolean): IPointData {
        const point = change ? local : {} as IPointData
        this.localToWorld(local, point, distance, relative)
        return point
    }

    public getPagePoint(world: IPointData, relative?: ILeaf, distance?: boolean, change?: boolean): IPointData {
        const layer = this.leafer ? this.leafer.zoomLayer : this
        return layer.getInnerPoint(world, relative, distance, change)
    }

    public getWorldPointByPage(page: IPointData, relative?: ILeaf, distance?: boolean, change?: boolean): IPointData {
        const layer = this.leafer ? this.leafer.zoomLayer : this
        return layer.getWorldPoint(page, relative, distance, change)
    }


    // transform 

    public setTransform(matrix: IMatrixData, resize?: boolean): void {
        setTransform(this, matrix, resize)
    }

    public transform(matrix: IMatrixData, resize?: boolean): void {
        transform(this, matrix, resize)
    }

    public move(x: number | IPointData, y?: number): void {
        moveLocal(this, x, y)
    }

    public scaleOf(origin: IPointData, scaleX: number, scaleY?: number, resize?: boolean): void {
        zoomOfLocal(this, tempToOuterOf(origin, this.localTransform), scaleX, scaleY, resize)
    }

    public rotateOf(origin: IPointData, rotation: number): void {
        rotateOfLocal(this, tempToOuterOf(origin, this.localTransform), rotation)
    }

    public skewOf(origin: IPointData, skewX: number, skewY?: number, resize?: boolean): void {
        skewOfLocal(this, tempToOuterOf(origin, this.localTransform), skewX, skewY, resize)
    }


    public transformWorld(worldTransform?: IMatrixData, resize?: boolean): void {
        transformWorld(this, worldTransform, resize)
    }

    public moveWorld(x: number | IPointData, y?: number): void {
        moveWorld(this, x, y)
    }

    public scaleOfWorld(worldOrigin: IPointData, scaleX: number, scaleY?: number, resize?: boolean): void {
        zoomOfWorld(this, worldOrigin, scaleX, scaleY, resize)
    }

    public rotateOfWorld(worldOrigin: IPointData, rotation: number): void {
        rotateOfWorld(this, worldOrigin, rotation)
    }

    public skewOfWorld(worldOrigin: IPointData, skewX: number, skewY?: number, resize?: boolean): void {
        skewOfWorld(this, worldOrigin, skewX, skewY, resize)
    }


    // @leafer-ui/scale rewrite

    public scaleResize(scaleX: number, scaleY = scaleX, _noResize?: boolean): void {
        (this as ILeaf).scaleX *= scaleX;
        (this as ILeaf).scaleY *= scaleY
    }

    public __scaleResize(_scaleX: number, _scaleY: number): void { }

    // @leafer-ui/hit LeafHit rewrite

    public __hitWorld(_point: IRadiusPointData): boolean { return true }

    public __hit(_local: IRadiusPointData): boolean { return true }

    public __hitFill(_inner: IRadiusPointData): boolean { return true }

    public __hitStroke(_inner: IRadiusPointData, _strokeWidth: number): boolean { return true }

    public __hitPixel(_inner: IRadiusPointData): boolean { return true }

    public __drawHitPath(_canvas: ILeaferCanvas): void { }

    public __updateHitCanvas(): void { }

    // ---


    // LeafRender rewrite

    public __render(_canvas: ILeaferCanvas, _options: IRenderOptions): void { }

    public __drawFast(_canvas: ILeaferCanvas, _options: IRenderOptions): void { }

    public __draw(_canvas: ILeaferCanvas, _options: IRenderOptions): void { }


    public __clip(_canvas: ILeaferCanvas, _options: IRenderOptions): void { }

    public __renderShape(_canvas: ILeaferCanvas, _options: IRenderOptions, _ignoreFill?: boolean, _ignoreStroke?: boolean): void { }


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

    public remove(_child?: ILeaf, destroy?: boolean): void {
        if (this.parent) this.parent.remove(this, destroy)
    }

    public dropTo(parent: ILeaf, index?: number, resize?: boolean): void {
        drop(this, parent, index, resize)
    }

    // ---


    // LeafEventer rewrite

    public on(_type: string | string[], _listener: IEventListener, _options?: IEventListenerOptions | boolean): void { }

    public off(_type?: string | string[], _listener?: IEventListener, _options?: IEventListenerOptions | boolean): void { }

    public on_(_type: string | string[], _listener: IEventListener, _bind?: IObject, _options?: IEventListenerOptions | boolean): IEventListenerId { return undefined }

    public off_(_id: IEventListenerId | IEventListenerId[]): void { }

    public once(_type: string | string[], _listener: IEventListener, _capture?: boolean): void { }

    public emit(_type: string, _event?: IEvent | IObject, _capture?: boolean): void { }

    public emitEvent(_event?: IEvent, _capture?: boolean): void { }

    public hasEvent(_type: string, _capture?: boolean): boolean { return false }

    // ---

    static changeAttr(attrName: string, defaultValue: IValue, fn?: IAttrDecorator): void {
        fn ? this.addAttr(attrName, defaultValue, fn) : defineDataProcessor(this.prototype, attrName, defaultValue)
    }

    static addAttr(attrName: string, defaultValue: IValue, fn?: IAttrDecorator): void {
        if (!fn) fn = boundsType
        fn(defaultValue)(this.prototype, attrName)
    }


    public destroy(): void {
        if (!this.destroyed) {
            const { parent } = this
            if (parent) this.remove()
            if (this.children) (this as unknown as IBranch).removeAll(true)
            if (this.hasEvent(ChildEvent.DESTROY)) this.emitEvent(new ChildEvent(ChildEvent.DESTROY, this, parent))

            this.__.destroy()
            this.__layout.destroy()

            this.__captureMap = this.__bubbleMap = this.__parentWait = this.__leaferWait = null
            this.destroyed = true
        }
    }

}
