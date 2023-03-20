import { ILeafer, ILeaf, ILeafInputData, ILeafData, ILeaferCanvas, IRenderOptions, IMatrixWithBoundsData, __Number, __Boolean, ILeafLayout, InnerId, IHitCanvas, IRadiusPointData, IEventListenerMap, IEventListener, IEventListenerOptions, IEventListenerId, IEvent, IObject, IFunction, __String } from '@leafer/interface'
import { IncrementId } from '@leafer/math'
import { LeafData } from '@leafer/data'
import { LeafLayout } from '@leafer/layout'
import { LeafDataProxy, LeafMatrix, LeafBounds, LeafHit, LeafEventer, LeafRender } from '@leafer/display-module'
import { useModule } from '@leafer/decorator'


const { LEAF, create } = IncrementId

@useModule(LeafDataProxy)
@useModule(LeafMatrix)
@useModule(LeafBounds)
@useModule(LeafHit)
@useModule(LeafEventer)
@useModule(LeafRender)
export class Leaf implements ILeaf {

    public get tag(): string { return this.constructor.name }
    public readonly innerId: InnerId  // 内部唯一标识
    public get __DataProcessor() { return LeafData }
    public get __LayoutProcessor() { return LeafLayout }

    public leafer?: ILeafer
    public root?: ILeaf
    public parent?: ILeaf

    public __isRoot: boolean
    public __isBranch: boolean
    public __isBranchLeaf: boolean

    public __: ILeafData
    public __layout: ILeafLayout

    public __relative: IMatrixWithBoundsData
    public __world: IMatrixWithBoundsData

    public __worldOpacity: number
    public __renderTime: number // μs 1000微秒 = 1毫秒
    public __complex: boolean // 外观是否复杂

    public __level: number // 所在层级 0 -> 高
    public __tempNumber: number // 用于排序，记录最后一次在parent中的排序索引，可用于移除之后回退

    public __hitCanvas?: IHitCanvas

    // event
    public __captureMap?: IEventListenerMap
    public __bubbleMap?: IEventListenerMap

    public __parentWait?: IFunction[]


    // branch 
    public children?: ILeaf[]
    public __childBranchNumber?: number

    constructor(data?: ILeafInputData) {

        this.innerId = create(LEAF)

        this.__relative = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0, x: 0, y: 0, width: 0, height: 0 }
        this.__world = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0, x: 0, y: 0, width: 0, height: 0 }

        this.__worldOpacity = 1
        this.__renderTime = 2

        this.__ = new this.__DataProcessor(this)
        this.__layout = new this.__LayoutProcessor(this)

        if (data) Object.assign(this, data)
    }


    public __addParentWait(item: IFunction): void {
        this.__parentWait ? this.__parentWait.push(item) : this.__parentWait = [item]
    }

    public __runParentWait(): void {
        const len = this.__parentWait.length
        for (let i = 0; i < len; i++) {
            this.__parentWait[i]()
        }
        this.__parentWait = null
    }

    public __setAsLeafer(): void {
        this.leafer = this as unknown as ILeafer
    }

    public __setAsRoot(): void {
        this.__bindRoot(this)
        this.__isRoot = true
    }

    public __bindRoot(root: ILeaf): void {
        if (this.__isRoot) return

        this.root = root
        this.leafer = root.leafer
        this.__level = this.parent ? this.parent.__level + 1 : 1

        if (this.__isBranch) {
            const { children } = this
            for (let i = 0, len = children.length; i < len; i++) {
                children[i].__bindRoot(root)
            }
        }
    }


    // LeafDataProxy rewrite

    public __set(_attrName: string, _newValue: unknown): void { }

    public __get(_attrName: string): unknown { return undefined }

    public __updateAttr(_attrName: string): void { }

    // ---


    // worldOpacity rewrite, include visible

    public __updateWorldOpacity(): void { }

    // ---



    // LeafMatrix rewrite

    public __updateWorldMatrix(): void { }

    public __updateRelativeMatrix(): void { }

    // ---


    // LeafBounds rewrite

    public __updateWorldBounds(): void { }


    public __updateRelativeBoxBounds(): void { }

    public __updateRelativeEventBounds(): void { }

    public __updateRelativeRenderBounds(): void { }

    // box

    public __updateBoxBounds(): void { }

    public __updateEventBounds(): void { }

    public __updateRenderBounds(): void { }


    public __updateEventBoundsSpreadWidth(): number { return 0 }

    public __updateRenderBoundsSpreadWidth(): number { return 0 }


    public __onUpdateSize(): void { }

    // ---


    // LeafHit rewrite

    public __hitWorld(_point: IRadiusPointData): boolean { return true }

    public __hit(_local: IRadiusPointData): boolean { return true }

    public __updateHitCanvas(): void { }

    // ---


    // LeafRender rewrite

    public __render(_canvas: ILeaferCanvas, _options: IRenderOptions): void { }

    public __drawFast(_canvas: ILeaferCanvas, _options: IRenderOptions): void { }

    public __draw(_canvas: ILeaferCanvas, _options: IRenderOptions): void { }

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

    public remove(_child?: ILeaf): void { }

    // ---


    // LeafEventer rewrite

    public on(_type: string | string[], _listener: IEventListener, _options?: IEventListenerOptions | boolean): void { }

    public off(_type: string | string[], _listener: IEventListener, _options?: IEventListenerOptions | boolean): void { }

    public on__(_type: string | string[], _listener: IEventListener, _bind?: IObject, _options?: IEventListenerOptions | boolean): IEventListenerId { return undefined }

    public off__(_id: IEventListenerId | IEventListenerId[]): void { }

    public once(_type: string | string[], _listener: IEventListener, _capture?: boolean): void { }

    public emit(_type: string, _event?: IEvent | IObject, _capture?: boolean): void { }

    public emitEvent(_event?: IEvent, _capture?: boolean): void { }

    public hasEvent(_type: string, _capture?: boolean): boolean { return false }

    // ---

    public destroy(): void {
        if (this.__) {

            if (this.__isBranch) {
                this.children.forEach(child => { child.destroy() })
                this.children = null
            }

            if (this.__hitCanvas) {
                this.__hitCanvas.destroy()
                this.__hitCanvas = null
            }

            this.leafer = null
            this.root = null
            this.parent = null

            this.__.destroy()
            this.__layout.destroy()
            this.__ = null
            this.__layout = null

            this.__captureMap = null
            this.__bubbleMap = null
        }
    }

}
