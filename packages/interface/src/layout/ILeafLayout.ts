import { IBoundsData, IMatrixData, IOrientBoundsData } from '../math/IMath'
import { ILeaf } from '../display/ILeaf'

export type ILocationType = 'world' | 'local' | 'inner'
export type IBoundsType = 'content' | 'box' | 'stroke' | 'margin' | 'render'

export interface ILeafLayout {

    leaf: ILeaf

    proxyZoom: boolean

    // inner

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
    scaleChanged: boolean // scaleX scaleY
    rotationChanged: boolean // rotaiton, skewX skewY 数据更新

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
    affectChildrenSort?: boolean

    strokeSpread: number
    renderSpread: number
    strokeBoxSpread: number
    renderShapeSpread: number

    update(force?: boolean): void

    getTransform(locationType: ILocationType): IMatrixData
    getBounds(type: IBoundsType, locationType: ILocationType): IBoundsData
    getOrientBounds(type: IBoundsType, locationType?: ILocationType, relative?: ILeaf, unscale?: boolean): IOrientBoundsData

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
    scaleChange(): void
    rotationChange(): void
    matrixChange(): void

    // face
    surfaceChange(): void
    opacityChange(): void

    childrenSortChange(): void

    destroy(): void
}