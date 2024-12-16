import { ILeaf, ICursorType } from '../display/ILeaf'
import { IRenderer, IRendererConfig } from '../renderer/IRenderer'
import { IHitCanvas, ILeaferCanvas, ILeaferCanvasConfig, IHitCanvasConfig } from '../canvas/ILeaferCanvas'
import { ILayouter, ILayouterConfig } from '../layouter/ILayouter'
import { ISelector, ISelectorConfig } from '../selector/ISelector'
import { IInteraction, IInteractionCanvas, IInteractionConfig } from '../interaction/IInteraction'
import { IWatcher, IWatcherConfig } from '../watcher/IWatcher'
import { IAutoBounds, IBoundsData, IPointData, IScreenSizeData, IBounds, IClientPointData } from '../math/IMath'
import { ICanvasManager } from '../canvas/ICanvasManager'
import { IHitCanvasManager } from '../canvas/IHitCanvasManager'
import { IEventListenerId } from '../event/IEventer'
import { IFourNumber, IObject } from '../data/IData'
import { IZoomView } from '../display/IView'
import { IAppBase } from './IApp'
import { ILeaferImage, ILeaferImageConfig } from '../image/ILeaferImage'
import { IControl } from '../control/IControl'
import { IFunction } from '../function/IFunction'


export type ILeaferType = 'draw' | 'block' | 'editor' | 'design' | 'board' | 'document' | 'app' | 'website' | 'game' | 'player' | 'chart' | 'custom'
export interface ILeaferConfig extends IRendererConfig, ILeaferCanvasConfig, IInteractionConfig, ILayouterConfig {
    start?: boolean
    type?: ILeaferType
    mobile?: boolean
    realCanvas?: boolean
    lazySpeard?: IFourNumber
}

export interface ILeaferAttrData {
    running: boolean
    created: boolean
    ready: boolean
    viewReady: boolean
    imageReady: boolean
    viewCompleted: boolean
    layoutLocked: boolean

    transforming: boolean

    view: unknown

    canvas: ILeaferCanvas
    renderer: IRenderer

    watcher: IWatcher
    layouter: ILayouter

    selector?: ISelector
    interaction?: IInteraction

    canvasManager: ICanvasManager
    hitCanvasManager?: IHitCanvasManager

    autoLayout?: IAutoBounds
    lazyBounds: IBounds

    config: ILeaferConfig

    readonly cursorPoint: IPointData
    readonly clientBounds: IBoundsData
    leafs: number

    __eventIds: IEventListenerId[]
    __nextRenderWait: IFunction[]

    init(userConfig?: ILeaferConfig, parentApp?: IAppBase): void

    start(): void
    stop(): void

    unlockLayout(): void
    lockLayout(): void

    requestRender(change: boolean): void

    updateCursor(cursor?: ICursorType): void
    resize(size: IScreenSizeData): void

    waitReady(item: IFunction, bind?: IObject): void
    waitViewReady(item: IFunction, bind?: IObject): void
    waitViewCompleted(item: IFunction, bind?: IObject): void

    zoom(zoomType: IZoomType, padding?: IFourNumber, fixedScale?: boolean): IBoundsData
    getValidMove(moveX: number, moveY: number): IPointData
    getValidScale(changeScale: number): number

    getWorldPointByClient(clientPoint: IClientPointData, updateClient?: boolean): IPointData
    getPagePointByClient(clientPoint: IClientPointData, updateClient?: boolean): IPointData
    updateClientBounds(): void

    receiveEvent(event: any): void
}

export type IZoomType = 'in' | 'out' | 'fit' | 'fit-width' | 'fit-height' | number | ILeaf | ILeaf[] | IBoundsData

export interface ILeaferBase extends IZoomView, IControl, ILeaferAttrData {
    readonly isApp: boolean
    readonly app: ILeaferBase
    parent?: IAppBase
}

export interface ILeaferTypeCreator {
    list: ILeaferTypeList
    register(name: string, fn: ILeaferTypeFunction): void
    run(name: string, leafer: ILeaferBase): void
}

export interface ILeaferTypeFunction {
    (leafer: ILeaferBase): void
}

export interface ILeaferTypeList {
    [key: string]: ILeaferTypeFunction
}

export interface ICreator {
    image?(options?: ILeaferImageConfig): ILeaferImage
    canvas?(options?: ILeaferCanvasConfig, manager?: ICanvasManager): ILeaferCanvas
    hitCanvas?(options?: IHitCanvasConfig, manager?: ICanvasManager): IHitCanvas
    hitCanvasManager?(): IHitCanvasManager

    watcher?(target: ILeaf, options?: IWatcherConfig): IWatcher
    layouter?(target: ILeaf, options?: ILayouterConfig): ILayouter
    renderer?(target: ILeaf, canvas: ILeaferCanvas, options?: IRendererConfig): IRenderer
    selector?(target?: ILeaf, options?: ISelectorConfig): ISelector

    interaction?(target: ILeaf, canvas: IInteractionCanvas, selector: ISelector, options?: IInteractionConfig): IInteraction

    editor?(options?: IObject): ILeaf
}

export interface IUICreator {
    register(UI: IObject): void
    get(tag: string, data: IObject): IObject
}