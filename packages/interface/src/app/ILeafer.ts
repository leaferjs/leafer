import { ILeaf } from '../display/ILeaf'
import { IRenderer, IRendererConfig } from '../renderer/IRenderer'
import { IHitCanvas, ILeaferCanvas, ILeaferCanvasConfig, IHitCanvasConfig } from '../canvas/ILeaferCanvas'
import { ILayouter, ILayouterConfig } from '../layouter/ILayouter'
import { ISelector, ISelectorConfig } from '../selector/ISelector'
import { IInteraction, IInteractionCanvas, IInteractionConfig } from '../interaction/IInteraction'
import { IWatcher, IWatcherConfig } from '../watcher/IWatcher'
import { IAutoBounds, IPointData, IScreenSizeData } from '../math/IMath'
import { ICanvasManager } from '../canvas/ICanvasManager'
import { IHitCanvasManager } from '../canvas/IHitCanvasManager'
import { IEventListenerId } from '../event/IEventer'
import { IObject } from '../data/IData'
import { IZoomView } from '../display/IView'
import { IApp } from './IApp'
import { ILeaferImage, ILeaferImageConfig } from '../image/ILeaferImage'
import { IControl } from '../control/IControl'
import { IFunction } from '../function/IFunction'


export type ILeaferType = 'draw' | 'design' | 'board' | 'document' | 'user'
export interface ILeaferConfig extends IRendererConfig, ILeaferCanvasConfig, IInteractionConfig, ILayouterConfig {
    start?: boolean
    type?: ILeaferType
    realCanvas?: boolean
}

export interface ILeafer extends IZoomView, IControl {

    readonly isApp: boolean
    readonly app: ILeafer
    parent?: IApp

    running: boolean
    created: boolean
    ready: boolean
    viewReady: boolean
    viewCompleted: boolean

    pixelRatio: number

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

    config: ILeaferConfig

    readonly cursorPoint: IPointData

    __eventIds: IEventListenerId[]
    __nextRenderWait: IFunction[]

    init(userConfig?: ILeaferConfig, parentApp?: IApp): void
    setZoomLayer(zoomLayer: ILeaf, moveLayer?: ILeaf): void
    forceFullRender(): void
    updateCursor(): void
    resize(size: IScreenSizeData): void

    waitReady(item: IFunction): void
    waitViewReady(item: IFunction): void
    waitViewCompleted(item: IFunction): void
}

export interface ILeaferTypeCreator {
    list: ILeaferTypeList
    register(name: string, fn: ILeaferTypeFunction): void
    run(name: string, leafer: ILeafer): void
}

export interface ILeaferTypeFunction {
    (leafer: ILeafer): void
}

export interface ILeaferTypeList {
    [key: string]: ILeaferTypeFunction
}

export interface ICreator {
    image?(options?: ILeaferImageConfig): ILeaferImage
    canvas?(options?: ILeaferCanvasConfig, manager?: ICanvasManager): ILeaferCanvas
    hitCanvas?(options?: IHitCanvasConfig, manager?: ICanvasManager): IHitCanvas

    watcher?(target: ILeaf, options?: IWatcherConfig): IWatcher
    layouter?(target: ILeaf, options?: ILayouterConfig): ILayouter
    renderer?(target: ILeaf, canvas: ILeaferCanvas, options?: IRendererConfig): IRenderer
    selector?(target: ILeaf, options?: ISelectorConfig): ISelector

    interaction?(target: ILeaf, canvas: IInteractionCanvas, selector: ISelector, options?: IInteractionConfig): IInteraction
}

export interface IUICreator {
    register(UI: IObject): void
    get(tag: string, data: IObject): IObject
}