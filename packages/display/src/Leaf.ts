import { ILeaferBase, ILeaf, ILeafInputData, ILeafData, ILeaferCanvas, IRenderOptions, IBoundsType, ILocationType, IMatrixWithBoundsData, ILayoutBoundsData, IValue, ILeafLayout, InnerId, IHitCanvas, IRadiusPointData, IEventListenerMap, IEventListener, IEventListenerId, IEvent, IObject, IFunction, IPointData, IBoundsData, IBranch, IFindMethod, IMatrixData, IAttrDecorator, IMatrixWithBoundsScaleData, IMatrixWithScaleData, IAlign, IJSONOptions, IEventParamsMap, IEventOption, IAxis, IMotionPathData, IUnitData, IRotationPointData, ITransition, IValueFunction, IEventParams, IScaleData, IScaleFixed, IFourNumber } from '@leafer/interface'
import { BoundsHelper, IncrementId, MathHelper, MatrixHelper, PointHelper } from '@leafer/math'
import { LeafData, isUndefined, DataHelper } from '@leafer/data'
import { LeafLayout } from '@leafer/layout'
import { LeafDataProxy, LeafMatrix, LeafBounds, LeafEventer, LeafRender } from '@leafer/display-module'
import { boundsType, useModule, defineDataProcessor } from '@leafer/decorator'
import { LeafHelper } from '@leafer/helper'
import { ChildEvent } from '@leafer/event'
import { ImageManager } from '@leafer/image'
import { Plugin } from '@leafer/debug'


const { LEAF, create } = IncrementId
const { stintSet } = DataHelper
const { toInnerPoint, toOuterPoint, multiplyParent } = MatrixHelper
const { toOuterOf } = BoundsHelper
const { copy, move } = PointHelper
const { getScaleFixedData } = MathHelper
const { moveLocal, zoomOfLocal, rotateOfLocal, skewOfLocal, moveWorld, zoomOfWorld, rotateOfWorld, skewOfWorld, transform, transformWorld, setTransform, getFlipTransform, getLocalOrigin, getRelativeWorld, drop } = LeafHelper

@useModule(LeafDataProxy)
@useModule(LeafMatrix)
@useModule(LeafBounds)
@useModule(LeafEventer)
@useModule(LeafRender)
export class Leaf<TInputData = ILeafInputData> implements ILeaf {

    public get tag(): string { return this.__tag }
    public set tag(_value: string) { }

    public get __tag(): string { return 'Leaf' }

    public readonly innerId: InnerId  // 内部唯一标识
    public get innerName(): string { return this.__.name || this.tag + this.innerId }

    public get __DataProcessor() { return LeafData }
    public get __LayoutProcessor() { return LeafLayout }

    public leafer?: ILeaferBase
    public parent?: ILeaf

    public get leaferIsCreated(): boolean { return this.leafer && this.leafer.created }
    public get leaferIsReady(): boolean { return this.leafer && this.leafer.ready }

    public get isLeafer(): boolean { return false }
    public get isBranch(): boolean { return false }
    public get isBranchLeaf(): boolean { return false }

    public skipJSON?: boolean // 跳过 JSON 导出
    public syncEventer?: ILeaf // 同步触发一样事件的元素
    public lockNormalStyle?: boolean

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

    public __scrollWorld?: IMatrixWithBoundsScaleData
    public get scrollWorldTransform(): IMatrixWithScaleData { this.updateLayout(); return this.__scrollWorld || this.__world }

    // now bounds
    public get boxBounds(): IBoundsData { return this.getBounds('box', 'inner') }
    public get renderBounds(): IBoundsData { return this.getBounds('render', 'inner') }
    public get worldBoxBounds(): IBoundsData { return this.getBounds('box') }
    public get worldStrokeBounds(): IBoundsData { return this.getBounds('stroke') }
    public get worldRenderBounds(): IBoundsData { return this.getBounds('render') }

    // now opacity
    public get worldOpacity(): number { this.updateLayout(); return this.__worldOpacity }

    public __level: number // layer level  0 -> branch -> branch -> deep
    public __tempNumber: number // temp sort

    public get __worldFlipped(): boolean { return this.__world.scaleX < 0 || this.__world.scaleY < 0 }

    public __hasAutoLayout?: boolean
    public __hasMask?: boolean
    public __hasEraser?: boolean
    public __hitCanvas?: IHitCanvas

    public get __onlyHitMask(): boolean { return this.__hasMask && !this.__.hitChildren }
    public get __ignoreHitWorld(): boolean { return (this.__hasMask || this.__hasEraser) && this.__.hitChildren }
    public get __inLazyBounds(): boolean { return this.leaferIsCreated && this.leafer.lazyBounds.hit(this.__world) }

    public get pathInputed(): boolean { return this.__.__pathInputed as unknown as boolean }

    // event
    public set event(map: IEventParamsMap) { this.on(map) }

    public __captureMap?: IEventListenerMap
    public __bubbleMap?: IEventListenerMap

    public __hasLocalEvent?: boolean
    public __hasWorldEvent?: boolean

    // branch 
    public children?: ILeaf[]
    public topChildren?: ILeaf[]

    public destroyed: boolean


    constructor(data?: TInputData) {
        this.innerId = create(LEAF)
        this.reset(data)
        if (this.__bubbleMap) this.__emitLifeEvent(ChildEvent.CREATED)
    }


    public reset(data?: ILeafInputData): void {
        if (this.leafer) this.leafer.forceRender(this.__world) // fix: add old bounds rendering

        if (data as any !== 0) {  // 设为 0 时可用于 text boxStyle 节省开销
            this.__world = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0, x: 0, y: 0, width: 0, height: 0, scaleX: 1, scaleY: 1 }
            if (data !== null) this.__local = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0, x: 0, y: 0, width: 0, height: 0 }
        }

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
        this.parent ? item() : this.on(ChildEvent.ADD, item, 'once')
    }

    public waitLeafer(item: IFunction, bind?: IObject): void {
        if (bind) item = item.bind(bind)
        this.leafer ? item() : this.on(ChildEvent.MOUNTED, item, 'once')
    }

    public nextRender(item: IFunction, bind?: IObject, off?: 'off'): void {
        this.leafer ? this.leafer.nextRender(item, bind, off) : this.waitLeafer(() => this.leafer.nextRender(item, bind, off))
    }

    public removeNextRender(item: IFunction): void {
        this.nextRender(item, null, 'off')
    }

    public __bindLeafer(leafer: ILeaferBase | null): void {
        if (this.isLeafer && leafer !== null) leafer = this as unknown as ILeaferBase

        if (this.leafer && !leafer) this.leafer.leafs--

        this.leafer = leafer

        if (leafer) {
            leafer.leafs++
            this.__level = this.parent ? this.parent.__level + 1 : 1
            if ((this as ILeaf).animation) this.__runAnimation('in')
            if (this.__bubbleMap) this.__emitLifeEvent(ChildEvent.MOUNTED)
        } else {
            this.__emitLifeEvent(ChildEvent.UNMOUNTED)
        }

        if (this.isBranch) {
            const { children } = this
            for (let i = 0, len = children.length; i < len; i++) {
                children[i].__bindLeafer(leafer)
            }
        }
    }

    // data

    public set(_data: IObject, _isTemp?: boolean): void { }

    public get<K extends keyof this>(_name?: K | K[] | ILeafInputData): ILeafInputData | this[K] { return undefined }

    public setAttr(name: string, value: any): void { (this as IObject)[name] = value }
    public getAttr(name: string): any { return (this as IObject)[name] }

    public getComputedAttr(name: string): any { return (this.__ as IObject)[name] }

    public toJSON(options?: IJSONOptions): IObject {
        if (options) this.__layout.update()
        return this.__.__getInputData(null, options)
    }

    public toString(options?: IJSONOptions): string {
        return JSON.stringify(this.toJSON(options))
    }

    public toSVG(): string { return undefined }

    public __SVG(_data: IObject): void { }

    public toHTML(): string { return undefined }

    // LeafDataProxy rewrite

    public __setAttr(_attrName: string, _newValue: IValue): boolean { return true }

    public __getAttr(_attrName: string): IValue { return undefined }

    public setProxyAttr(_attrName: string, _newValue: IValue): void { }

    public getProxyAttr(_attrName: string): IValue { return undefined }

    // ---


    // find

    public find(_condition: number | string | IFindMethod, _options?: any): ILeaf[] { return undefined }

    public findTag(_tag: string | string[]): ILeaf[] { return undefined }

    public findOne(_condition: number | string | IFindMethod, _options?: any): ILeaf | undefined { return undefined }

    public findId(_id: number | string): ILeaf | undefined { return undefined }

    // ---


    // @leafer-in/state rewrite

    public focus(_value?: boolean): void { }

    public updateState(): void { }

    // ---


    public updateLayout(): void {
        this.__layout.update()
    }

    public forceUpdate(attrName?: string): void {
        if (isUndefined(attrName)) attrName = 'width'
        else if (attrName === 'surface') attrName = 'blendMode'
        const value = this.__.__getInput(attrName);
        (this.__ as any)[attrName] = isUndefined(value) ? null : undefined;
        (this as any)[attrName] = value
    }

    public forceRender(_bounds?: IBoundsData, _sync?: boolean): void {
        this.forceUpdate('surface')
    }

    public __extraUpdate(): void {
        if (this.leaferIsReady) this.leafer.layouter.addExtra(this) // add part 额外更新元素
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

    public __updateBoxBounds(_secondLayout?: boolean, _bounds?: IBoundsData): void { }

    public __updateContentBounds(): void { }

    public __updateStrokeBounds(_bounds?: IBoundsData): void { }

    public __updateRenderBounds(_bounds?: IBoundsData): void { }


    public __updateAutoLayout(): void { }

    public __updateFlowLayout(): void { }

    public __updateNaturalSize(): void { }


    public __updateStrokeSpread(): IFourNumber { return 0 }

    public __updateRenderSpread(): IFourNumber { return 0 }

    public __onUpdateSize(): void { }

    // ---


    public __updateEraser(value?: boolean): void {
        this.__hasEraser = value ? true : this.children.some(item => item.__.eraser)
    }

    public __renderEraser(canvas: ILeaferCanvas, options: IRenderOptions): void {  // path eraser
        canvas.save()
        this.__clip(canvas, options)
        const { renderBounds: r } = this.__layout
        canvas.clearRect(r.x, r.y, r.width, r.height)
        canvas.restore()
    }

    public __updateMask(_value?: boolean): void {
        this.__hasMask = this.children.some(item => item.__.mask && item.__.visible && item.__.opacity)
    }

    // LeafMask rewrite

    public __renderMask(_canvas: ILeaferCanvas, _options: IRenderOptions): void { }


    // ---


    // convert

    public __getNowWorld(options: IRenderOptions): IMatrixWithBoundsScaleData {
        if (options.matrix) {
            if (!this.__cameraWorld) this.__cameraWorld = {} as IMatrixWithBoundsScaleData
            const cameraWorld = this.__cameraWorld, world = this.__world
            multiplyParent(world, options.matrix, cameraWorld, undefined, world)
            toOuterOf(this.__layout.renderBounds, cameraWorld, cameraWorld)
            stintSet(cameraWorld, 'half', world.half)
            stintSet(cameraWorld, 'ignorePixelSnap', world.ignorePixelSnap)
            return cameraWorld
        } else {
            return this.__world
        }
    }

    public getClampRenderScale(): number {
        let { scaleX } = this.__nowWorld || this.__world
        if (scaleX < 0) scaleX = -scaleX
        return scaleX > 1 ? scaleX : 1
    }

    public getRenderScaleData(abs?: boolean, scaleFixed?: IScaleFixed): IScaleData {
        return getScaleFixedData(ImageManager.patternLocked ? this.__world : this.__nowWorld, scaleFixed, true, abs)
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
        toInnerPoint(this.scrollWorldTransform, world, to, distance)
    }

    public innerToWorld(inner: IPointData, to?: IPointData, distance?: boolean, relative?: ILeaf): void {
        toOuterPoint(this.scrollWorldTransform, inner, to, distance)
        if (relative) relative.worldToInner(to ? to : inner, null, distance)
    }

    // simple

    public getBoxPoint(world: IPointData, relative?: ILeaf, distance?: boolean, change?: boolean): IPointData {
        return this.getBoxPointByInner(this.getInnerPoint(world, relative, distance, change), null, null, true)
    }

    public getBoxPointByInner(inner: IPointData, _relative?: ILeaf, _distance?: boolean, change?: boolean): IPointData {
        const point = change ? inner : { ...inner } as IPointData, { x, y } = this.boxBounds
        move(point, -x, -y)
        return point
    }

    public getInnerPoint(world: IPointData, relative?: ILeaf, distance?: boolean, change?: boolean): IPointData {
        const point = change ? world : {} as IPointData
        this.worldToInner(world, point, distance, relative)
        return point
    }

    public getInnerPointByBox(box: IPointData, _relative?: ILeaf, _distance?: boolean, change?: boolean): IPointData {
        const point = change ? box : { ...box } as IPointData, { x, y } = this.boxBounds
        move(point, x, y)
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

    public getPagePoint(world: IPointData, relative?: ILeaf, distance?: boolean, change?: boolean): IPointData {
        const layer = this.leafer ? this.leafer.zoomLayer : this
        return layer.getInnerPoint(world, relative, distance, change)
    }

    public getWorldPoint(inner: IPointData, relative?: ILeaf, distance?: boolean, change?: boolean): IPointData {
        const point = change ? inner : {} as IPointData
        this.innerToWorld(inner, point, distance, relative)
        return point
    }

    public getWorldPointByBox(box: IPointData, relative?: ILeaf, distance?: boolean, change?: boolean): IPointData {
        return this.getWorldPoint(this.getInnerPointByBox(box, null, null, change), relative, distance, true)
    }

    public getWorldPointByLocal(local: IPointData, relative?: ILeaf, distance?: boolean, change?: boolean): IPointData {
        const point = change ? local : {} as IPointData
        this.localToWorld(local, point, distance, relative)
        return point
    }

    public getWorldPointByPage(page: IPointData, relative?: ILeaf, distance?: boolean, change?: boolean): IPointData {
        const layer = this.leafer ? this.leafer.zoomLayer : this
        return layer.getWorldPoint(page, relative, distance, change)
    }


    // transform 

    public setTransform(matrix: IMatrixData, resize?: boolean, transition?: ITransition): void {
        setTransform(this, matrix, resize, transition)
    }

    public transform(matrix: IMatrixData, resize?: boolean, transition?: ITransition): void {
        transform(this, matrix, resize, transition)
    }

    public move(x: number | IPointData, y?: number, transition?: ITransition): void {
        moveLocal(this, x, y, transition)
    }


    public moveInner(x: number | IPointData, y?: number, transition?: ITransition): void {
        moveWorld(this, x, y, true, transition)
    }

    public scaleOf(origin: IPointData | IAlign, scaleX: number, scaleY?: number | ITransition, resize?: boolean, transition?: ITransition): void {
        zoomOfLocal(this, getLocalOrigin(this, origin), scaleX, scaleY, resize, transition)
    }

    public rotateOf(origin: IPointData | IAlign, rotation: number, transition?: ITransition): void {
        rotateOfLocal(this, getLocalOrigin(this, origin), rotation, transition)
    }

    public skewOf(origin: IPointData | IAlign, skewX: number, skewY?: number, resize?: boolean, transition?: ITransition): void {
        skewOfLocal(this, getLocalOrigin(this, origin), skewX, skewY, resize, transition)
    }


    public transformWorld(worldTransform?: IMatrixData, resize?: boolean, transition?: ITransition): void {
        transformWorld(this, worldTransform, resize, transition)
    }

    public moveWorld(x: number | IPointData, y?: number, transition?: ITransition): void {
        moveWorld(this, x, y, false, transition)
    }

    public scaleOfWorld(worldOrigin: IPointData, scaleX: number, scaleY?: number | ITransition, resize?: boolean, transition?: ITransition): void {
        zoomOfWorld(this, worldOrigin, scaleX, scaleY, resize, transition)
    }

    public rotateOfWorld(worldOrigin: IPointData, rotation: number): void {
        rotateOfWorld(this, worldOrigin, rotation)
    }

    public skewOfWorld(worldOrigin: IPointData, skewX: number, skewY?: number, resize?: boolean, transition?: ITransition): void {
        skewOfWorld(this, worldOrigin, skewX, skewY, resize, transition)
    }

    public flip(axis: IAxis, transition?: ITransition): void {
        transform(this, getFlipTransform(this, axis), false, transition)
    }


    // @leafer-in/resize rewrite

    public scaleResize(scaleX: number, scaleY = scaleX, _noResize?: boolean): void {
        (this as ILeaf).scaleX *= scaleX;
        (this as ILeaf).scaleY *= scaleY
    }

    public __scaleResize(_scaleX: number, _scaleY: number): void { }


    public resizeWidth(_width: number): void { }

    public resizeHeight(_height: number): void { }


    // @leafer-ui/hit LeafHit rewrite

    public hit(_world: IPointData, _hitRadius?: number): boolean { return true }

    public __hitWorld(_point: IRadiusPointData, _forceHitFill?: boolean): boolean { return true }

    public __hit(_local: IRadiusPointData, _forceHitFill?: boolean): boolean { return true }

    public __hitFill(_inner: IRadiusPointData): boolean { return true }

    public __hitStroke(_inner: IRadiusPointData, _strokeWidth: number): boolean { return true }

    public __hitPixel(_inner: IRadiusPointData): boolean { return true }

    public __drawHitPath(_canvas: ILeaferCanvas): void { }

    public __updateHitCanvas(): void { }

    // ---


    // LeafRender rewrite

    public __render(_canvas: ILeaferCanvas, _options: IRenderOptions): void { }

    public __renderComplex(_canvas: ILeaferCanvas, _options: IRenderOptions): void { }

    public __drawFast(_canvas: ILeaferCanvas, _options: IRenderOptions): void { }

    public __draw(_canvas: ILeaferCanvas, _options: IRenderOptions, _originCanvas?: ILeaferCanvas): void { }


    public __clip(_canvas: ILeaferCanvas, _options: IRenderOptions): void { }

    public __renderShape(_canvas: ILeaferCanvas, _options: IRenderOptions): void { }

    public __drawShape(_canvas: ILeaferCanvas, _options: IRenderOptions): void { }


    public __updateWorldOpacity(): void { }

    public __updateChange(): void { }

    // ---


    // path

    public __drawPath(_canvas: ILeaferCanvas): void { }

    public __drawRenderPath(_canvas: ILeaferCanvas): void { }

    public __updatePath(): void { }

    public __updateRenderPath(): void { }

    // ---


    // @leafer-in/motion-path rewrite

    public getMotionPathData(): IMotionPathData {
        return Plugin.need('path')
    }

    public getMotionPoint(_motionDistance: number | IUnitData): IRotationPointData {
        return Plugin.need('path')
    }

    public getMotionTotal(): number {
        return 0
    }

    public __updateMotionPath(): void { }

    // ---


    // @leafer-in/animate rewrite
    public __runAnimation(_type: 'in' | 'out', _complete?: IFunction): void { }


    // Branch rewrite

    public __updateSortChildren(): void { }

    public add(_child: ILeaf | ILeaf[] | ILeafInputData | ILeafInputData[], _index?: number): void { }

    public remove(_child?: ILeaf | number | string | IFindMethod, destroy?: boolean): void {
        if (this.parent) this.parent.remove(this, destroy)
    }

    public dropTo(parent: ILeaf, index?: number, resize?: boolean): void {
        drop(this, parent, index, resize)
    }

    // ---


    // LeafEventer rewrite

    public on(_type: string | string[] | IEventParams[] | IEventParamsMap, _listener?: IEventListener, _options?: IEventOption): void { }

    public off(_type?: string | string[], _listener?: IEventListener, _options?: IEventOption): void { }

    public on_(_type: string | string[] | IEventParams[], _listener?: IEventListener, _bind?: IObject, _options?: IEventOption): IEventListenerId { return undefined }

    public off_(_id: IEventListenerId | IEventListenerId[]): void { }

    public once(_type: string | string[] | IEventParams[], _listener?: IEventListener, _captureOrBind?: boolean | IObject, _capture?: boolean): void { }

    public emit(_type: string, _event?: IEvent | IObject, _capture?: boolean): void { }

    public emitEvent(_event?: IEvent, _capture?: boolean): void { }

    public hasEvent(_type: string, _capture?: boolean): boolean { return false }

    // ---

    static changeAttr(attrName: string, defaultValue: IValue | IValueFunction, fn?: IAttrDecorator): void {
        fn ? this.addAttr(attrName, defaultValue, fn) : defineDataProcessor(this.prototype, attrName, defaultValue)
    }

    static addAttr(attrName: string, defaultValue: IValue | IValueFunction, fn?: IAttrDecorator, helpValue?: IValue): void {
        if (!fn) fn = boundsType
        fn(defaultValue, helpValue)(this.prototype, attrName)
    }


    public __emitLifeEvent(type: string): void {
        if (this.hasEvent(type)) this.emitEvent(new ChildEvent(type, this, this.parent))
    }


    public destroy(): void {
        if (!this.destroyed) {
            if (this.parent) this.remove()
            if (this.children) (this as unknown as IBranch).clear()

            this.__emitLifeEvent(ChildEvent.DESTROY)

            this.__.destroy()
            this.__layout.destroy();

            (this as ILeaf).destroyEventer()
            this.destroyed = true
        }
    }

}
