import { ILeaferCanvas } from '../canvas/ILeaferCanvas'
import { ILeaf } from '../display/ILeaf'
import { IBounds, IMatrixWithScaleData } from '../math/IMath'
import { IFunction } from '../function/IFunction'
import { IControl } from '../control/IControl'

export interface IRenderOptions {
    includes?: boolean,
    bounds?: IBounds,
    hideBounds?: IBounds,
    matrix?: IMatrixWithScaleData,
    inCamera?: boolean
    dimOpacity?: number
}

export interface IRendererConfig {
    usePartRender?: boolean
    maxFPS?: number
    fill?: string
}

export interface IRenderer extends IControl {
    target: ILeaf
    canvas: ILeaferCanvas
    updateBlocks: IBounds[]

    FPS: number
    totalTimes: number
    times: number

    running: boolean
    rendering: boolean

    waitAgain: boolean
    changed: boolean
    ignore: boolean

    config: IRendererConfig

    update(change?: boolean): void

    requestLayout(): void

    checkRender(): void
    render(callback?: IFunction): void
    renderAgain(): void
    renderOnce(callback?: IFunction): void
    partRender(): void
    clipRender(bounds: IBounds): void
    fullRender(): void

    addBlock(block: IBounds): void
    mergeBlocks(): void
}