import { ILeaf, ILeafLayout, ILayoutLocationType, ILayoutBoundsType, IBoundsData, IMatrixData, } from '@leafer/interface'
import { BoundsHelper } from '@leafer/math'


const { setByBoundsTimesMatrix } = BoundsHelper

export class LeafLayout implements ILeafLayout {

    public leaf: ILeaf

    public useZoomProxy: boolean

    // local

    public boxBounds: IBoundsData    //  | content + padding |
    public eventBounds: IBoundsData  //  | boxBounds + border |  
    public renderBounds: IBoundsData //  | eventBounds + shadow |

    // auto layout
    public marginBounds: IBoundsData //  | eventBounds + margin |
    public contentBounds: IBoundsData // | content |  

    // relative

    //relativeBoxBounds: IBoundsData = leaf.__relative
    public relativeEventBounds: IBoundsData
    public relativeRenderBounds: IBoundsData

    // world temp
    protected _worldBoxBounds: IBoundsData
    protected _worldEventBounds: IBoundsData
    // worldRenderBounds: IBoundsData = leaf.__world

    // state

    // matrix changed
    public matrixChanged: boolean // include positionChanged scaleChanged skewChanged
    public positionChanged: boolean // x, y
    public scaleChanged: boolean // scaleX scaleY
    public rotationChanged: boolean // rotaiton, skewX scaleY

    // bounds
    public boundsChanged: boolean

    public boxBoundsChanged: boolean
    public eventBoundsChanged: boolean
    public renderBoundsChanged: boolean

    public localBoxBoundsChanged: boolean

    // face
    public surfaceChanged: boolean
    public opacityChanged: boolean

    public hitCanvasChanged: boolean

    public childrenSortChanged?: boolean

    // keep state
    public affectScaleOrRotation: boolean
    public affectRotation: boolean
    public eventBoundsSpreadWidth: number
    public renderBoundsSpreadWidth: number
    public renderShapeBoundsSpreadWidth: number


    constructor(leaf: ILeaf) {
        this.leaf = leaf
        this.renderBounds = this.eventBounds = this.boxBounds = { x: 0, y: 0, width: 0, height: 0 }
        this.relativeRenderBounds = this.relativeEventBounds = leaf.__relative
    }


    public update(): void {
        const { leafer } = this.leaf
        if (leafer && leafer.watcher.changed) {
            if (!leafer.running) leafer.start()
            leafer.layouter.layout()
        }
    }

    public getTransform(type: ILayoutLocationType): IMatrixData {
        this.update()
        return type === 'world' ? this.leaf.__world : this.leaf.__relative
    }

    public getBounds(type: ILayoutLocationType, boundsType: ILayoutBoundsType): IBoundsData {

        this.update()

        if (type === 'world') {

            switch (boundsType) {
                case 'render':
                    return this.leaf.__world
                case 'box':
                    return this.getWorldBoxBounds()
                case 'event':
                    return this.getWorldEventBounds()
            }

        } else if (type === 'local') {

            switch (boundsType) {
                case 'render':
                    return this.renderBounds
                case 'box':
                    return this.boxBounds
                case 'event':
                    return this.eventBounds
            }

        } else {

            switch (boundsType) {
                case 'render':
                    return this.relativeRenderBounds
                case 'box':
                    return this.leaf.__relative
                case 'event':
                    return this.relativeEventBounds
            }

        }
        return this.leaf.__world
    }


    protected getWorldBoxBounds(): IBoundsData {
        this._worldBoxBounds || (this._worldBoxBounds = {} as IBoundsData)
        setByBoundsTimesMatrix(this._worldBoxBounds, this.boxBounds, this.leaf.__world)
        return this._worldBoxBounds
    }

    protected getWorldEventBounds(): IBoundsData {
        this._worldEventBounds || (this._worldEventBounds = {} as IBoundsData)
        setByBoundsTimesMatrix(this._worldEventBounds, this.eventBounds, this.leaf.__world)
        return this._worldEventBounds
    }

    // 独立 / 引用 boxBounds

    public eventBoundsSpreadCancel(): void {
        const same = this.renderBounds === this.eventBounds
        this.eventBounds = this.boxBounds
        this.relativeEventBounds = this.leaf.__relative
        if (same) this.renderBoundsSpreadCancel()
    }
    public renderBoundsSpreadCancel(): void {
        this.renderBounds = this.eventBounds
        this.relativeRenderBounds = this.relativeEventBounds
    }

    public eventBoundsSpread(): void {
        const { x, y, width, height } = this.eventBounds
        this.eventBounds = { x, y, width, height }
        this.relativeEventBounds = { x, y, width, height }
        if (!this.renderBoundsSpreadWidth) this.renderBoundsSpreadCancel()
    }
    public renderBoundsSpread(): void {
        const { x, y, width, height } = this.renderBounds
        this.renderBounds = { x, y, width, height }
        this.relativeRenderBounds = { x, y, width, height }
    }


    // bounds

    public boxBoundsChange(): void {
        this.boxBoundsChanged = true
        this.localBoxBoundsChanged || this.localBoxBoundsChange()
        this.hitCanvasChanged = true
    }

    public localBoxBoundsChange(): void {
        this.localBoxBoundsChanged = true
        this.boundsChanged = true
    }

    public eventBoundsChange(): void {
        this.eventBoundsChanged = true
        this.eventBoundsSpreadWidth || (this.eventBoundsSpreadWidth = 1)
        this.boundsChanged = true
    }

    public renderBoundsChange(): void {
        this.renderBoundsChanged = true
        this.renderBoundsSpreadWidth || (this.renderBoundsSpreadWidth = 1)
        this.boundsChanged = true
    }


    // matrix

    public positionChange(): void {
        this.positionChanged = true
        this.matrixChanged = true
        this.localBoxBoundsChanged || this.localBoxBoundsChange()
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
        this.localBoxBoundsChanged || this.localBoxBoundsChange()
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
        this.leaf = undefined
    }

}