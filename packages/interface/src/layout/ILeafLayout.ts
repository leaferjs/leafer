import { IBoundsData, IMatrixData } from '../math/IMath'
import { ILeaf } from '../display/ILeaf'

export type ILayoutLocationType = 'world' | 'relative' | 'local'
export type ILayoutBoundsType = 'content' | 'box' | 'event' | 'margin' | 'render'

export interface ILeafLayout {

    leaf: ILeaf

    useZoomProxy: boolean

    // local

    boxBounds: IBoundsData    //  | content + padding |
    eventBounds: IBoundsData  //  | boxBounds + border |  
    renderBounds: IBoundsData //  | eventBounds + shadow |

    // auto layout
    marginBounds: IBoundsData //  | eventBounds + margin |
    contentBounds: IBoundsData // | content |  

    // relative

    //relativeBoxBounds: IBoundsData = leaf.__local
    relativeEventBounds: IBoundsData
    relativeRenderBounds: IBoundsData

    // state

    // matrix changed
    matrixChanged: boolean
    positionChanged: boolean // x, y
    scaleChanged: boolean // scaleX scaleY
    rotationChanged: boolean // rotaiton, skewX scaleY 数据更新

    // bounds changed
    boundsChanged: boolean

    boxBoundsChanged: boolean
    eventBoundsChanged: boolean
    renderBoundsChanged: boolean

    localBoxBoundsChanged: boolean // position

    // face changed
    surfaceChanged: boolean
    opacityChanged: boolean

    hitCanvasChanged: boolean

    childrenSortChanged?: boolean

    // keep state
    affectScaleOrRotation: boolean
    affectRotation: boolean
    eventBoundsSpreadWidth: number
    renderBoundsSpreadWidth: number
    renderShapeBoundsSpreadWidth: number

    update(): void

    getTransform(type: ILayoutLocationType): IMatrixData
    getBounds(type: ILayoutLocationType, boundsType: ILayoutBoundsType): IBoundsData

    // 独立 / 引用 boxBounds
    eventBoundsSpread(): void
    renderBoundsSpread(): void
    eventBoundsSpreadCancel(): void
    renderBoundsSpreadCancel(): void

    // bounds
    boxBoundsChange(): void
    eventBoundsChange(): void
    renderBoundsChange(): void

    // matrix
    positionChange(): void
    scaleChange(): void
    rotationChange(): void

    // face
    surfaceChange(): void
    opacityChange(): void

    destroy(): void
}