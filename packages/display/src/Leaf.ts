import { ILeaferBase, ILeaf, ILeafInputData, ILeafData, ILeaferCanvas, IRenderOptions, IBoundsType, ILocationType, IMatrixWithBoundsData, ILayoutBoundsData, IValue, ILeafLayout, InnerId, IHitCanvas, IRadiusPointData, IEventListenerMap, IEventListener, IEventListenerId, IEvent, IObject, IFunction, IPointData, IBoundsData, IBranch, IFindMethod, IMatrixData, IAttrDecorator, IMatrixWithBoundsScaleData, IMatrixWithScaleData, IAlign, IJSONOptions, IEventParamsMap, IEventOption, IAxis, IMotionPathData, IUnitData, IRotationPointData, ITransition, IValueFunction, IEventParams, IScaleData, IScaleFixed, IFourNumber } from '@leafer/interface'
import { BoundsHelper, IncrementId, MathHelper, MatrixHelper, PointHelper } from '@leafer/math'
import { LeafData, isUndefined, DataHelper } from '@leafer/data'
import { LeafLayout } from '@leafer/layout'
import { LeafDataProxy, LeafMatrix, LeafBounds, LeafEventer, LeafRender } from '@leafer/display-module'
import { boundsType, useModule, defineDataProcessor } from '@leafer/decorator'
import { LeafHelper } from '@leafer/helper'
import { ChildEvent } from '@leafer/event'
import { ImageManager } from '@leafer/image'


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
            if (leafer.cacheId) LeafHelper.cacheId(this)
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


    // @leafer-in/resize rewrite

    public scaleResize(scaleX: number, scaleY = scaleX, _noResize?: boolean, _boundsType?: IBoundsType): void {
        (this as ILeaf).scaleX *= scaleX;
        (this as ILeaf).scaleY *= scaleY
    }


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

    public getRenderScaleData(abs?: boolean, scaleFixed?: IScaleFixed, unscale = true): IScaleData {
        return getScaleFixedData(ImageManager.patternLocked ? this.__world : this.__nowWorld || this.__world, scaleFixed, unscale, abs)
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

    public getBoxPoint(world: IPointData, relative?: ILeaf, distance?: boolean, change?: boolean): IPointData {
        const inner = this.getInnerPoint(world, relative, distance, change)
        if (distance) return inner
        return this.getBoxPointByInner(inner, null, null, true)
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

    public setTransform(matrix: IMatrixData, resize?: boolean, transition?: ITransition, boundsType?: IBoundsType): void {
        setTransform(this, matrix, resize, transition, boundsType)
    }

    public transform(matrix: IMatrixData, resize?: boolean, transition?: ITransition, boundsType?: IBoundsType): void {
        transform(this, matrix, resize, transition, boundsType)
    }

    public move(x: number | IPointData, y?: number, transition?: ITransition): void {
        moveLocal(this, x, y, transition)
    }


    public moveInner(x: number | IPointData, y?: number, transition?: ITransition): void {
        moveWorld(this, x, y, true, transition)
    }

    public scaleOf(origin: IPointData | IAlign, scaleX: number, scaleY?: number | ITransition, resize?: boolean, transition?: ITransition, boundsType?: IBoundsType): void {
        zoomOfLocal(this, getLocalOrigin(this, origin), scaleX, scaleY, resize, transition, boundsType)
    }

    public rotateOf(origin: IPointData | IAlign, rotation: number, transition?: ITransition): void {
        rotateOfLocal(this, getLocalOrigin(this, origin), rotation, transition)
    }

    public skewOf(origin: IPointData | IAlign, skewX: number, skewY?: number, resize?: boolean, transition?: ITransition): void {
        skewOfLocal(this, getLocalOrigin(this, origin), skewX, skewY, resize, transition)
    }


    public transformWorld(worldTransform?: IMatrixData, resize?: boolean, transition?: ITransition, boundsType?: IBoundsType): void {
        transformWorld(this, worldTransform, resize, transition, boundsType)
    }

    public moveWorld(x: number | IPointData, y?: number, transition?: ITransition): void {
        moveWorld(this, x, y, false, transition)
    }

    public scaleOfWorld(worldOrigin: IPointData, scaleX: number, scaleY?: number | ITransition, resize?: boolean, transition?: ITransition, boundsType?: IBoundsType): void {
        zoomOfWorld(this, worldOrigin, scaleX, scaleY, resize, transition, boundsType)
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


    public remove(_child?: ILeaf | number | string | IFindMethod, destroy?: boolean): void {
        if (this.parent) this.parent.remove(this, destroy)
    }

    public dropTo(parent: ILeaf, index?: number, resize?: boolean): void {
        drop(this, parent, index, resize)
    }


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

export interface Leaf {

    // UI rewrite
    set(data: IObject, isTemp?: boolean): void
    get<K extends keyof this>(name?: K | K[] | ILeafInputData): ILeafInputData | this[K]
    toSVG(): string
    __SVG(data: IObject): void
    toHTML(): string

    // LeafDataProxy rewrite
    __setAttr(attrName: string, newValue: IValue): boolean
    __getAttr(attrName: string): IValue
    setProxyAttr(attrName: string, newValue: IValue): void
    getProxyAttr(attrName: string): IValue

    // find
    find(condition: number | string | IFindMethod, options?: any): ILeaf[]
    findTag(tag: string | string[]): ILeaf[]
    findOne(condition: number | string | IFindMethod, options?: any): ILeaf | undefined
    findId(id: number | string): ILeaf | undefined

    // @leafer-in/state rewrite
    focus(value?: boolean): void
    updateState(): void

    // LeafMatrix rewrite
    __updateWorldMatrix(): void
    __updateLocalMatrix(): void

    // LeafBounds rewrite
    __updateWorldBounds(): void
    __updateLocalBounds(): void
    __updateLocalBoxBounds(): void
    __updateLocalStrokeBounds(): void
    __updateLocalRenderBounds(): void
    __updateBoxBounds(secondLayout?: boolean, bounds?: IBoundsData): void
    __updateContentBounds(): void
    __updateStrokeBounds(bounds?: IBoundsData): void
    __updateRenderBounds(bounds?: IBoundsData): void
    __updateAutoLayout(): void
    __updateFlowLayout(): void
    __updateNaturalSize(): void
    __updateStrokeSpread(): IFourNumber
    __updateRenderSpread(): IFourNumber
    __onUpdateSize(): void

    // LeafMask rewrite
    __renderMask(canvas: ILeaferCanvas, options: IRenderOptions): void

    // @leafer-in/resize rewrite
    __scaleResize(scaleX: number, scaleY: number): void
    resizeWidth(width: number, relative?: ILocationType): void
    resizeHeight(height: number, relative?: ILocationType): void

    // @leafer-ui/hit LeafHit rewrite
    hit(world: IPointData, hitRadius?: number): boolean
    __hitWorld(point: IRadiusPointData, forceHitFill?: boolean): boolean
    __hit(local: IRadiusPointData, forceHitFill?: boolean): boolean
    __hitFill(inner: IRadiusPointData): boolean
    __hitStroke(inner: IRadiusPointData, strokeWidth: number): boolean
    __hitPixel(inner: IRadiusPointData): boolean
    __drawHitPath(canvas: ILeaferCanvas): void
    __updateHitCanvas(): void

    // LeafRender rewrite
    __render(canvas: ILeaferCanvas, options: IRenderOptions): void
    __drawFast(canvas: ILeaferCanvas, options: IRenderOptions): void
    __draw(canvas: ILeaferCanvas, options: IRenderOptions, originCanvas?: ILeaferCanvas): void
    __clip(canvas: ILeaferCanvas, options: IRenderOptions): void
    __renderShape(canvas: ILeaferCanvas, options: IRenderOptions): void
    __drawShape(canvas: ILeaferCanvas, options: IRenderOptions): void
    __updateWorldOpacity(): void
    __updateChange(): void



    // path
    __drawPath(canvas: ILeaferCanvas): void
    __drawRenderPath(canvas: ILeaferCanvas): void
    __updatePath(): void
    __updateRenderPath(updateCache?: boolean): void

    // @leafer-in/motion-path rewrite
    getMotionPathData(): IMotionPathData
    getMotionPoint(motionDistance: number | IUnitData): IRotationPointData
    getMotionTotal(): number
    __updateMotionPath(): void

    // @leafer-in/animate rewrite
    __runAnimation(type: 'in' | 'out', complete?: IFunction): void

    // Branch rewrite
    __updateSortChildren(): void
    add(child: ILeaf | ILeaf[] | ILeafInputData | ILeafInputData[], index?: number): void

    // LeafEventer rewrite
    on(type: string | string[] | IEventParams[] | IEventParamsMap, listener?: IEventListener, options?: IEventOption): void
    off(type?: string | string[], listener?: IEventListener, options?: IEventOption): void
    on_(type: string | string[] | IEventParams[], listener?: IEventListener, bind?: IObject, options?: IEventOption): IEventListenerId
    off_(id: IEventListenerId | IEventListenerId[]): void
    once(type: string | string[] | IEventParams[], listener?: IEventListener, captureOrBind?: boolean | IObject, capture?: boolean): void
    emit(type: string, event?: IEvent | IObject, capture?: boolean): void
    emitEvent(event?: IEvent, capture?: boolean): void
    hasEvent(type: string, capture?: boolean): boolean

}