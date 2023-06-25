import { ILeaf } from '../display/ILeaf'
import { IRenderer, IRendererConfig } from '../renderer/IRenderer'
import { IHitCanvas, ILeaferCanvas, ILeaferCanvasConfig, IHitCanvasConfig } from '../canvas/ILeaferCanvas'
import { ILayouter, ILayouterConfig } from '../layouter/ILayouter'
import { ISelector, ISelectorConfig } from '../selector/ISelector'
import { IInteraction, IInteractionCanvas, IInteractionConfig } from '../interaction/IInteraction'
import { IWatcher, IWatcherConfig } from '../watcher/IWatcher'
import { IAutoBounds, IScreenSizeData } from '../math/IMath'
import { ICanvasManager } from '../canvas/ICanvasManager'
import { IHitCanvasManager } from '../canvas/IHitCanvasManager'
import { IImageManager } from '../image/IImageManager'
import { IEventListenerId } from '../event/IEventer'
import { IObject } from '../data/IData'
import { IZoomView } from '../display/IView'
import { IApp } from './IApp'
import { ILeaferImage, ILeaferImageConfig } from '../image/ILeaferImage'
import { IControl } from '../control/IControl'


export type ILeaferType = 'draw' | 'design' | 'board' | 'document' | 'user'
export interface ILeaferConfig extends IRendererConfig, ILeaferCanvasConfig, IInteractionConfig, ILayouterConfig {
    start?: boolean
    type?: ILeaferType
    realCanvas?: boolean
}

export interface ILeafer extends IZoomView, IControl {

    readonly isApp: boolean
    parent?: IApp

    running: boolean
    ready: boolean
    viewReady: boolean

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
    imageManager: IImageManager

    autoLayout?: IAutoBounds

    config: ILeaferConfig

    __eventIds: IEventListenerId[]

    init(userConfig?: ILeaferConfig, parentApp?: IApp): void

    forceFullRender(): void

    resize(size: IScreenSizeData): void
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