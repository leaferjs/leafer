import { ILeaf, ILeafLayout, ILocationType, IBoundsType, IBoundsData, IMatrixData, IOrientBoundsData, IOrientPointData, IPointData } from '@leafer/interface'
import { BoundsHelper, MatrixHelper } from '@leafer/math'
import { Platform } from '@leafer/platform'


const { toOuterOf } = BoundsHelper

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

    public localStrokeBounds: IBoundsData
    public localRenderBounds: IBoundsData

    // world temp
    protected _worldContentBounds: IBoundsData
    protected _worldBoxBounds: IBoundsData
    protected _worldStrokeBounds: IBoundsData

    // state

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


    constructor(leaf: ILeaf) {
        this.leaf = leaf
        this.renderBounds = this.strokeBounds = this.boxBounds = { x: 0, y: 0, width: 0, height: 0 }
        this.localRenderBounds = this.localStrokeBounds = leaf.__local
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

    public getTransform(locationType: ILocationType): IMatrixData {
        this.update()
        return locationType === 'world' ? this.leaf.__world : this.leaf.__local
    }

    public getBounds(type: IBoundsType, locationType: ILocationType): IBoundsData {

        this.update()

        if (locationType === 'world') {

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

        } else if (locationType === 'inner') {

            return this.getInnerBounds(type)

        } else {

            switch (type) {
                case 'render':
                    return this.localRenderBounds
                case 'margin':
                case 'content':
                case 'box':
                    return this.leaf.__local
                case 'stroke':
                    return this.localStrokeBounds
            }

        }

    }

    public getInnerBounds(type: IBoundsType): IBoundsData {
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

    public getOrientBounds(type: IBoundsType, locationType: ILocationType, relative?: ILeaf, unscale?: boolean): IOrientBoundsData {
        const { leaf } = this
        let point: IPointData, orient: IOrientPointData
        let bounds: IBoundsData = this.getInnerBounds(type)

        if (locationType === 'world') {
            point = leaf.getWorldPoint(bounds, relative)
            orient = leaf.__world
        } else if (locationType === 'local') {
            point = leaf.getLocalPointByInner(bounds, relative)
            orient = leaf.__ as IOrientPointData
        } else {
            point = bounds
            orient = MatrixHelper.defaultWorld
        }

        let { width, height } = bounds
        let { scaleX, scaleY, rotation, skewX, skewY } = orient

        if (relative) {
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
        this.localStrokeBounds = this.leaf.__local
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