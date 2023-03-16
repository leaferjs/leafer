import { ILeaf } from '../display/ILeaf'
import { IRenderer, IRendererConfig } from '../renderer/IRenderer'
import { IHitCanvas, ILeaferCanvas, ILeaferCanvasConfig, IHitCanvasConfig } from '../canvas/ILeaferCanvas'
import { ILayouter, ILayouterConfig } from '../layouter/ILayouter'
import { ISelector } from '../selector/ISelector'
import { IInteraction, IInteractionConfig } from '../interaction/IInteraction'
import { IWatcher } from '../watcher/IWatcher'
import { IAutoBounds, IScreenSizeData } from '../math/IMath'
import { ICanvasManager } from '../canvas/ICanvasManager'
import { IHitCanvasManager } from '../canvas/IHitCanvasManager'
import { IImageManager } from '../image/IImageManager'
import { IObject } from '../data/IData'
import { IZoomView } from '../display/IView'
import { IApp } from './IApp'
import { ILeaferImage, ILeaferImageConfig } from '../image/ILeaferImage'
import { IEvent } from '../event/IEvent'


export interface ILeaferConfig extends IRendererConfig, ILeaferCanvasConfig, IInteractionConfig, ILayouterConfig {
    start?: boolean
    zoom?: boolean
    move?: boolean
}

export interface ILeafer extends IZoomView {

    creator: ICreator

    readonly isApp: boolean
    parent?: IApp

    running: boolean

    autoLayout?: IAutoBounds

    canvas: ILeaferCanvas
    renderer: IRenderer

    watcher: IWatcher
    layouter: ILayouter

    selector?: ISelector
    interaction?: IInteraction

    canvasManager: ICanvasManager
    hitCanvasManager?: IHitCanvasManager
    imageManager: IImageManager

    start(): void
    stop(): void

    resize(size: IScreenSizeData): void
}

export interface ICreator {
    ui?(tag: string, data?: IObject): ILeaf
    event?(type: string, event: IEvent): IEvent

    image?(options?: ILeaferImageConfig): ILeaferImage
    canvas?(options?: ILeaferCanvasConfig, manager?: ICanvasManager): ILeaferCanvas
    hitCanvas?(options?: IHitCanvasConfig, manager?: ICanvasManager): IHitCanvas

    watcher?(target: ILeaf): IWatcher
    layouter?(target: ILeaf): ILayouter
    renderer?(target: ILeaf, canvas: ILeaferCanvas, options: IRendererConfig): IRenderer
    selector?(target: ILeaf): ISelector

    interaction?(target: ILeaf, canvas: ILeaferCanvas, selector: ISelector, options?: IInteractionConfig): IInteraction
}

export interface IUICreator {
    register(UI: IObject): void
    get(tag: string, data: IObject): IObject
}