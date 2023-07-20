import { IBoundsData, IMatrixData, IMatrixDecompositionData } from '../math/IMath'
import { ILeaf } from '../display/ILeaf'

export type ILayoutLocationType = 'world' | 'local' | 'inner'
export type ILayoutBoundsType = 'content' | 'box' | 'stroke' | 'margin' | 'render'

export interface ILeafLayout {

    leaf: ILeaf

    useZoomProxy: boolean

    // local

    boxBounds: IBoundsData    //  | content + padding |
    strokeBounds: IBoundsData  //  | boxBounds + border |  
    renderBounds: IBoundsData //  | strokeBounds + shadow |

    // auto layout
    marginBounds: IBoundsData //  | strokeBounds + margin |
    contentBounds: IBoundsData // | content |  

    // local

    //localBoxBounds: IBoundsData = leaf.__local
    localStrokeBounds: IBoundsData
    localRenderBounds: IBoundsData

    // state

    // matrix changed
    matrixChanged: boolean // include positionChanged scaleChanged skewChanged
    positionChanged: boolean // x, y
    originChanged?: boolean // originX originY
    scaleChanged: boolean // scaleX scaleY
    rotationChanged: boolean // rotaiton, skewX scaleY 数据更新

    // bounds changed
    boundsChanged: boolean

    boxChanged: boolean
    strokeChanged: boolean
    renderChanged: boolean

    localBoxChanged: boolean // position

    // face changed
    surfaceChanged: boolean
    opacityChanged: boolean

    hitCanvasChanged: boolean

    childrenSortChanged?: boolean

    // keep state
    affectScaleOrRotation: boolean
    affectRotation: boolean

    strokeSpread: number
    renderSpread: number
    strokeBoxSpread: number
    renderShapeSpread: number

    checkUpdate(force?: boolean): void

    getTransform(locationType: ILayoutLocationType): IMatrixData
    decomposeTransform(locationType: ILayoutLocationType): IMatrixDecompositionData
    getBounds(type: ILayoutBoundsType, locationType: ILayoutLocationType): IBoundsData

    // 独立 / 引用 boxBounds
    spreadStroke(): void
    spreadRender(): void
    spreadStrokeCancel(): void
    spreadRenderCancel(): void

    // bounds
    boxChange(): void
    localBoxChange(): void
    strokeChange(): void
    renderChange(): void

    // matrix
    positionChange(): void
    scaleChange(): void
    rotationChange(): void

    // face
    surfaceChange(): void
    opacityChange(): void

    destroy(): void
}