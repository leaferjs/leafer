import { ILeaf, ILeafLayout, ILocationType, IBoundsType, IBoundsData, IMatrixData, ILayoutBoundsData, ILayoutData, IPointData } from '@leafer/interface'
import { Bounds, BoundsHelper, Matrix, MatrixHelper } from '@leafer/math'
import { Platform } from '@leafer/platform'


const { toOuterOf, getPoints } = BoundsHelper

export class LeafLayout implements ILeafLayout {

    public leaf: ILeaf

    public proxyZoom: boolean

    // local

    public boxBounds: IBoundsData
    public strokeBounds: IBoundsData
    public renderBounds: IBoundsData

    // auto layout
    public marginBounds: IBoundsData
    public contentBounds: IBoundsData

    // local

    public localStrokeBounds?: IBoundsData
    public localRenderBounds?: IBoundsData

    // world temp
    protected _worldContentBounds: IBoundsData
    protected _worldBoxBounds: IBoundsData
    protected _worldStrokeBounds: IBoundsData

    // state

    public resized: boolean

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


    constructor(leaf: ILeaf) {
        this.leaf = leaf
        this.renderBounds = this.strokeBounds = this.boxBounds = { x: 0, y: 0, width: 0, height: 0 }
        if (leaf.__local) this.localRenderBounds = this.localStrokeBounds = leaf.__local
        this.boxChange()
        this.matrixChange()
    }

    public update(force?: boolean): void {
        const { leafer } = this.leaf
        if (leafer) {
            if (leafer.ready) {
                if ((Platform.realtimeLayout || force) && leafer.watcher.changed) leafer.layouter.layout()
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
        switch (relative) {
            case 'world':
                return this.leaf.__world
            case 'local':
                return this.leaf.__localMatrix
            case 'inner':
                return MatrixHelper.defaultMatrix
            default:
                return new Matrix(this.leaf.__world).divideParent(relative.__world)
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
            case 'margin':
            case 'box':
                return this.boxBounds
            case 'stroke':
                return this.strokeBounds
        }
    }

    public getLocalBounds(type: IBoundsType = 'box'): IBoundsData {
        switch (type) {
            case 'render':
                if (this.localRenderBounds) return this.localRenderBounds
            case 'stroke':
                if (this.localStrokeBounds) return this.localStrokeBounds
            case 'margin':
            case 'content':
            case 'box':
                return this.leaf.__localBounds
        }
    }

    public getWorldBounds(type: IBoundsType = 'box'): IBoundsData {
        switch (type) {
            case 'render':
                return this.leaf.__world
            case 'content':
                if (this.contentBounds) return this.getWorldContentBounds()
            case 'margin':
            case 'box':
                return this.getWorldBoxBounds()
            case 'margin':
            case 'stroke':
                return this.getWorldStrokeBounds()
        }
    }

    public getBoundsPoints(type?: IBoundsType, relative: ILocationType | ILeaf = 'world'): IPointData[] {
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
            default:
                relativeLeaf = relative
        }
        if (relativeLeaf !== undefined) points.forEach(point => leaf.innerToWorld(point, null, false, relativeLeaf))
        return points
    }

    public getLayoutBounds(type?: IBoundsType, relative: ILocationType | ILeaf = 'world', unscale?: boolean): ILayoutBoundsData {
        const { leaf } = this
        let point: IPointData, layout: ILayoutData
        let bounds: IBoundsData = this.getInnerBounds(type)

        switch (relative) {
            case 'world':
                point = leaf.getWorldPoint(bounds)
                layout = leaf.__world
                break
            case 'local':
                point = leaf.getLocalPointByInner(bounds)
                layout = leaf.__ as ILayoutData
                break
            case 'inner':
                point = bounds
                layout = MatrixHelper.defaultWorld
                break
            default:
                point = leaf.getWorldPoint(bounds, relative)
                layout = leaf.__world
        }

        let { scaleX, scaleY, rotation, skewX, skewY } = layout
        let { width, height } = bounds

        if (typeof relative === 'object') {
            const r = relative.__world
            scaleX /= r.scaleX
            scaleY /= r.scaleY
            rotation -= r.rotation
            skewX -= r.skewX
            skewY -= r.skewY
        }

        if (unscale) {
            const uScaleX = scaleX < 0 ? -scaleX : scaleX
            const uScaleY = scaleY < 0 ? -scaleY : scaleY
            scaleX /= uScaleX
            scaleY /= uScaleY
            width *= uScaleX
            height *= uScaleY
        }

        return { x: point.x, y: point.y, scaleX, scaleY, rotation, skewX, skewY, width, height }
    }

    protected getWorldContentBounds(): IBoundsData {
        this._worldContentBounds || (this._worldContentBounds = {} as IBoundsData)
        toOuterOf(this.contentBounds, this.leaf.__world, this._worldContentBounds)
        return this._worldContentBounds
    }

    protected getWorldBoxBounds(): IBoundsData {
        this._worldBoxBounds || (this._worldBoxBounds = {} as IBoundsData)
        toOuterOf(this.boxBounds, this.leaf.__world, this._worldBoxBounds)
        return this._worldBoxBounds
    }

    protected getWorldStrokeBounds(): IBoundsData {
        this._worldStrokeBounds || (this._worldStrokeBounds = {} as IBoundsData)
        toOuterOf(this.strokeBounds, this.leaf.__world, this._worldStrokeBounds)
        return this._worldStrokeBounds
    }

    // 独立 / 引用 boxBounds

    public spreadStrokeCancel(): void {
        const same = this.renderBounds === this.strokeBounds
        this.strokeBounds = this.boxBounds
        this.localStrokeBounds = this.leaf.__localBounds
        if (same) this.spreadRenderCancel()
    }
    public spreadRenderCancel(): void {
        this.renderBounds = this.strokeBounds
        this.localRenderBounds = this.localStrokeBounds
    }

    public spreadStroke(): void {
        const { x, y, width, height } = this.strokeBounds
        this.strokeBounds = { x, y, width, height }
        this.localStrokeBounds = { x, y, width, height }
        if (!this.renderSpread) this.spreadRenderCancel()
    }
    public spreadRender(): void {
        const { x, y, width, height } = this.renderBounds
        this.renderBounds = { x, y, width, height }
        this.localRenderBounds = { x, y, width, height }
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