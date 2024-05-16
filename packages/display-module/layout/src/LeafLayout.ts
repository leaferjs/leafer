import { ILeaf, ILeafLayout, ILocationType, IBoundsType, IBoundsData, IMatrixData, ILayoutBoundsData, IPointData } from '@leafer/interface'
import { Bounds, BoundsHelper, MatrixHelper, PointHelper } from '@leafer/math'
import { LeafHelper } from '@leafer/helper'
import { Platform } from '@leafer/platform'


const { getRelativeWorld } = LeafHelper
const { toOuterOf, getPoints, copy } = BoundsHelper
const localContent = '_localContentBounds'
const worldContent = '_worldContentBounds', worldBox = '_worldBoxBounds', worldStroke = '_worldStrokeBounds'

export class LeafLayout implements ILeafLayout {

    public leaf: ILeaf

    public proxyZoom: boolean

    // inner

    public get contentBounds(): IBoundsData { return this._contentBounds || this.boxBounds }
    public boxBounds: IBoundsData
    public get strokeBounds(): IBoundsData { return this._strokeBounds || this.boxBounds }
    public get renderBounds(): IBoundsData { return this._renderBounds || this.boxBounds }

    public _contentBounds: IBoundsData
    public _strokeBounds: IBoundsData
    public _renderBounds: IBoundsData

    // local

    public get localContentBounds(): IBoundsData { toOuterOf(this.contentBounds, this.leaf.__localMatrix, this[localContent] || (this[localContent] = {} as IBoundsData)); return this[localContent] }
    // localBoxBounds: IBoundsData // use leaf.__localBoxBounds
    public get localStrokeBounds(): IBoundsData { return this._localStrokeBounds || this }
    public get localRenderBounds(): IBoundsData { return this._localRenderBounds || this }

    protected _localContentBounds?: IBoundsData
    protected _localStrokeBounds?: IBoundsData
    protected _localRenderBounds?: IBoundsData

    // world

    public get worldContentBounds(): IBoundsData { toOuterOf(this.contentBounds, this.leaf.__world, this[worldContent] || (this[worldContent] = {} as IBoundsData)); return this[worldContent] }
    public get worldBoxBounds(): IBoundsData { toOuterOf(this.boxBounds, this.leaf.__world, this[worldBox] || (this[worldBox] = {} as IBoundsData)); return this[worldBox] }
    public get worldStrokeBounds(): IBoundsData { toOuterOf(this.strokeBounds, this.leaf.__world, this[worldStroke] || (this[worldStroke] = {} as IBoundsData)); return this[worldStroke] }
    // worldRenderBounds: IBoundsData // use leaf.__world

    protected _worldContentBounds: IBoundsData
    protected _worldBoxBounds: IBoundsData
    protected _worldStrokeBounds: IBoundsData

    // state

    public resized: boolean
    public waitAutoLayout: boolean

    // matrix changed
    public matrixChanged: boolean
    public scaleChanged: boolean
    public rotationChanged: boolean

    // bounds
    public boundsChanged: boolean

    public boxChanged: boolean
    public strokeChanged: boolean
    public renderChanged: boolean

    public localBoxChanged: boolean

    // face
    public surfaceChanged: boolean
    public opacityChanged: boolean

    public hitCanvasChanged: boolean

    public childrenSortChanged?: boolean

    // keep state
    public affectScaleOrRotation: boolean
    public affectRotation: boolean
    public affectChildrenSort?: boolean

    public strokeSpread: number
    public renderSpread: number
    public strokeBoxSpread: number
    public renderShapeSpread: number

    // temp local
    public get a() { return 1 }
    public get b() { return 0 }
    public get c() { return 0 }
    public get d() { return 1 }
    public get e() { return this.leaf.__.x }
    public get f() { return this.leaf.__.y }
    public get x() { return this.e + this.boxBounds.x }
    public get y() { return this.f + this.boxBounds.y }
    public get width() { return this.boxBounds.width }
    public get height() { return this.boxBounds.height }


    constructor(leaf: ILeaf) {
        this.leaf = leaf
        this.boxBounds = { x: 0, y: 0, width: 0, height: 0 }
        if (this.leaf.__local) this._localRenderBounds = this._localStrokeBounds = this.leaf.__local
        this.boxChange()
        this.matrixChange()
    }

    public createLocal(): void {
        const local = this.leaf.__local = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0, x: 0, y: 0, width: 0, height: 0 }
        if (!this._localStrokeBounds) this._localStrokeBounds = local
        if (!this._localRenderBounds) this._localRenderBounds = local
    }

    public update(): void {
        const { leafer } = this.leaf
        if (leafer) {
            if (leafer.ready) {
                if (leafer.watcher.changed) leafer.layouter.layout()
            } else {
                leafer.start()
            }
        } else {
            let root = this.leaf
            while (root.parent && !root.parent.leafer) { root = root.parent }
            Platform.layout(root)
        }
    }

    public getTransform(relative: ILocationType | ILeaf = 'world'): IMatrixData {
        this.update()
        const { leaf } = this
        switch (relative) {
            case 'world':
                return leaf.__world
            case 'local':
                return leaf.__localMatrix
            case 'inner':
                return MatrixHelper.defaultMatrix
            case 'page':
                relative = leaf.zoomLayer
            default:
                return getRelativeWorld(leaf, relative)
        }
    }

    public getBounds(type?: IBoundsType, relative: ILocationType | ILeaf = 'world'): IBoundsData {
        this.update()
        switch (relative) {
            case 'world':
                return this.getWorldBounds(type)
            case 'local':
                return this.getLocalBounds(type)
            case 'inner':
                return this.getInnerBounds(type)
            case 'page':
                relative = this.leaf.zoomLayer
            default:
                return new Bounds(this.getInnerBounds(type)).toOuterOf(this.getTransform(relative))
        }
    }

    public getInnerBounds(type: IBoundsType = 'box'): IBoundsData {
        switch (type) {
            case 'render':
                return this.renderBounds
            case 'content':
                if (this.contentBounds) return this.contentBounds
            case 'box':
                return this.boxBounds
            case 'stroke':
                return this.strokeBounds
        }
    }

    public getLocalBounds(type: IBoundsType = 'box'): IBoundsData {
        switch (type) {
            case 'render':
                return this.localRenderBounds
            case 'stroke':
                return this.localStrokeBounds
            case 'content':
                if (this.contentBounds) return this.localContentBounds
            case 'box':
                return this.leaf.__localBoxBounds
        }
    }

    public getWorldBounds(type: IBoundsType = 'box'): IBoundsData {
        switch (type) {
            case 'render':
                return this.leaf.__world
            case 'stroke':
                return this.worldStrokeBounds
            case 'content':
                if (this.contentBounds) return this.worldContentBounds
            case 'box':
                return this.worldBoxBounds
        }
    }

    public getLayoutBounds(type?: IBoundsType, relative: ILocationType | ILeaf = 'world', unscale?: boolean): ILayoutBoundsData {
        const { leaf } = this
        let point: IPointData, matrix: IMatrixData, bounds: IBoundsData = this.getInnerBounds(type)

        switch (relative) {
            case 'world':
                point = leaf.getWorldPoint(bounds)
                matrix = leaf.__world
                break
            case 'local':
                point = leaf.getLocalPointByInner(bounds)
                matrix = leaf.__localMatrix
                break
            case 'inner':
                point = bounds
                matrix = MatrixHelper.defaultMatrix
                break
            case 'page':
                relative = leaf.zoomLayer
            default:
                point = leaf.getWorldPoint(bounds, relative)
                matrix = getRelativeWorld(leaf, relative, true)
        }

        const layoutBounds = MatrixHelper.getLayout(matrix) as ILayoutBoundsData
        copy(layoutBounds, bounds)
        PointHelper.copy(layoutBounds, point)

        if (unscale) {
            const { scaleX, scaleY } = layoutBounds
            const uScaleX = Math.abs(scaleX)
            const uScaleY = Math.abs(scaleY)
            if (uScaleX !== 1 || uScaleY !== 1) {
                layoutBounds.scaleX /= uScaleX
                layoutBounds.scaleY /= uScaleY
                layoutBounds.width *= uScaleX
                layoutBounds.height *= uScaleY
            }
        }

        return layoutBounds
    }

    public getLayoutPoints(type?: IBoundsType, relative: ILocationType | ILeaf = 'world'): IPointData[] {
        const { leaf } = this
        const points = getPoints(this.getInnerBounds(type))
        let relativeLeaf: ILeaf
        switch (relative) {
            case 'world':
                relativeLeaf = null
                break
            case 'local':
                relativeLeaf = leaf.parent
                break
            case 'inner':
                break
            case 'page':
                relative = leaf.zoomLayer
            default:
                relativeLeaf = relative
        }
        if (relativeLeaf !== undefined) points.forEach(point => leaf.innerToWorld(point, null, false, relativeLeaf))
        return points
    }

    // 独立 / 引用 boxBounds

    public shrinkContent(): void {
        const { x, y, width, height } = this.boxBounds
        this._contentBounds = { x, y, width, height }
    }

    public spreadStroke(): void {
        const { x, y, width, height } = this.strokeBounds
        this._strokeBounds = { x, y, width, height }
        this._localStrokeBounds = { x, y, width, height }
        if (!this.renderSpread) this.spreadRenderCancel()
    }
    public spreadRender(): void {
        const { x, y, width, height } = this.renderBounds
        this._renderBounds = { x, y, width, height }
        this._localRenderBounds = { x, y, width, height }
    }

    public shrinkContentCancel(): void {
        this._contentBounds = undefined
    }

    public spreadStrokeCancel(): void {
        const same = this.renderBounds === this.strokeBounds
        this._strokeBounds = this.boxBounds
        this._localStrokeBounds = this.leaf.__localBoxBounds
        if (same) this.spreadRenderCancel()
    }
    public spreadRenderCancel(): void {
        this._renderBounds = this._strokeBounds
        this._localRenderBounds = this._localStrokeBounds
    }


    // bounds

    public boxChange(): void {
        this.boxChanged = true
        this.localBoxChanged || this.localBoxChange()
        this.hitCanvasChanged = true
    }

    public localBoxChange(): void {
        this.localBoxChanged = true
        this.boundsChanged = true
    }

    public strokeChange(): void {
        this.strokeChanged = true
        this.strokeSpread || (this.strokeSpread = 1)
        this.boundsChanged = true
        this.hitCanvasChanged = true
    }

    public renderChange(): void {
        this.renderChanged = true
        this.renderSpread || (this.renderSpread = 1)
        this.boundsChanged = true
    }


    // matrix

    public scaleChange(): void {
        this.scaleChanged = true
        this._scaleOrRotationChange()
    }

    public rotationChange(): void {
        this.rotationChanged = true
        this.affectRotation = true
        this._scaleOrRotationChange()
    }

    protected _scaleOrRotationChange() {
        this.affectScaleOrRotation = true
        this.matrixChange()
        if (!this.leaf.__local) this.createLocal()
    }

    public matrixChange(): void {
        this.matrixChanged = true
        this.localBoxChanged || this.localBoxChange()
    }


    // face

    public surfaceChange(): void {
        this.surfaceChanged = true
    }

    public opacityChange(): void {
        this.opacityChanged = true
        this.surfaceChanged || this.surfaceChange()
    }

    public childrenSortChange(): void {
        if (!this.childrenSortChanged) {
            this.childrenSortChanged = true
            this.leaf.forceUpdate('surface')
        }
    }

    public destroy(): void { }

}