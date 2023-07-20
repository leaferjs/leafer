import { ILeaf, ILeafLayout, ILayoutLocationType, ILayoutBoundsType, IBoundsData, IMatrixData, IMatrixDecompositionData } from '@leafer/interface'
import { BoundsHelper, MatrixHelper } from '@leafer/math'
import { Platform } from '@leafer/platform'


const { toOuterOf } = BoundsHelper

export class LeafLayout implements ILeafLayout {

    public leaf: ILeaf

    public useZoomProxy: boolean

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
    public positionChanged: boolean
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

    public strokeSpread: number
    public renderSpread: number
    public strokeBoxSpread: number
    public renderShapeSpread: number


    constructor(leaf: ILeaf) {
        this.leaf = leaf
        this.renderBounds = this.strokeBounds = this.boxBounds = { x: 0, y: 0, width: 0, height: 0 }
        this.localRenderBounds = this.localStrokeBounds = leaf.__local
        this.boxChange()
    }


    public checkUpdate(force?: boolean): void {
        const { leafer } = this.leaf
        if (leafer) {
            if (leafer.ready) {
                if ((Platform.realtimeLayout || force) && leafer.watcher.changed) leafer.layouter.layout()
            } else {
                leafer.start()
            }
        } else {
            let root = this.leaf
            while (root.parent) { root = root.parent }
            Platform.layout(root)
        }
    }

    public getTransform(locationType: ILayoutLocationType): IMatrixData {
        this.checkUpdate()
        return locationType === 'world' ? this.leaf.__world : this.leaf.__local
    }

    public decomposeTransform(locationType: ILayoutLocationType): IMatrixDecompositionData {
        this.checkUpdate()
        return MatrixHelper.decompose(locationType === 'world' ? this.leaf.__world : this.leaf.__local)
    }

    public getBounds(type: ILayoutBoundsType, locationType: ILayoutLocationType): IBoundsData {

        this.checkUpdate()

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

    public positionChange(): void {
        this.positionChanged = true
        this.matrixChanged = true
        this.localBoxChanged || this.localBoxChange()
    }

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

    public destroy(): void {
        this.leaf = null
    }

}