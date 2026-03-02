import { IBoundsData, IMatrixData, ILayoutBoundsData, IPointData } from '../math/IMath'
import { ILeaf } from '../display/ILeaf'
import { IFourNumber } from '../data/IData'

export type ILocationType = 'world' | 'page' | 'local' | 'inner'
export type IBoundsType = 'content' | 'box' | 'stroke' | 'render'

export interface ILeafLayout {

    leaf: ILeaf

    proxyZoom: boolean

    // inner

    contentBounds: IBoundsData // | content | 
    boxBounds: IBoundsData    //  | content + padding |
    strokeBounds: IBoundsData  //  | boxBounds + border |  
    renderBounds: IBoundsData //  | strokeBounds + shadow |

    // local

    localContentBounds: IBoundsData
    // localBoxBounds: IBoundsData // use leaf.__localBoxBounds
    localStrokeBounds: IBoundsData
    localRenderBounds: IBoundsData
    localOuterBounds?: IBoundsData //  | renderBounds * (1 / scaleFixed) |

    // world

    worldContentBounds: IBoundsData
    worldBoxBounds: IBoundsData
    worldStrokeBounds: IBoundsData
    // worldRenderBounds: IBoundsData // use leaf.__world

    // Box 元素专用

    childrenBoxBounds?: IBoundsData
    childrenStrokeBounds?: IBoundsData
    childrenRenderBounds?: IBoundsData

    // state
    resized: 'inner' | 'scale' | 'local' // inner > scale > local,  设置了inner之后不能被覆盖
    waitAutoLayout: boolean

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
    stateStyleChanged?: boolean // hoverStyle ...

    // config changed
    scrollConfigChanged?: boolean
    editConfigChanged?: boolean

    // keep state
    affectScaleOrRotation: boolean
    affectRotation: boolean
    affectChildrenSort?: boolean

    strokeSpread: IFourNumber
    strokeBoxSpread: number // 用于生成strokeBounds
    renderSpread: IFourNumber // -1 表示需监视变化，不影响实际renderBounds，目前用在Box上
    renderShapeSpread: IFourNumber

    // scale fixed
    scaleFixed?: number
    strokeScaleFixed?: number
    hasOuter?: boolean // localOuterBounds: scaleFixed < 1 || strokeScaleFixed < 1

    // temp local
    a: number
    b: number
    c: number
    d: number
    e: number
    f: number
    x: number
    y: number
    width: number
    height: number

    createLocal(): void

    update(): void

    getTransform(relative?: ILocationType | ILeaf): IMatrixData
    getBounds(type?: IBoundsType, relative?: ILocationType | ILeaf): IBoundsData
    getLayoutBounds(type?: IBoundsType, relative?: ILocationType | ILeaf, unscale?: boolean): ILayoutBoundsData
    getLayoutPoints(type?: IBoundsType, relative?: ILocationType | ILeaf): IPointData[]

    // 独立 / 引用 boxBounds
    shrinkContent(): void
    spreadStroke(): void
    spreadRender(): void
    shrinkContentCancel(): void
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