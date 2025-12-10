import { ILeaferCanvas } from '../canvas/ILeaferCanvas'
import { ILeaf } from '../display/ILeaf'
import { IBounds, IMatrixWithScaleData } from '../math/IMath'
import { IFunction } from '../function/IFunction'
import { IControl } from '../control/IControl'
import { ILeafList } from '../data/IList'
import { IObject } from '../data/IData'

export interface IRenderOptions {
    includes?: boolean,
    bounds?: IBounds,
    hideBounds?: IBounds,
    matrix?: IMatrixWithScaleData,
    inCamera?: boolean
    exporting?: boolean // 是否通过 export() 导出渲染

    dimOpacity?: number // 淡化
    topList?: ILeafList // 收集需要置顶渲染的内容
    topRendering?: boolean // 是否正在渲染置顶内容

    // 只渲染外形
    shape?: boolean
    ignoreFill?: boolean, // 绘制外形时忽略fill
    ignoreStroke?: boolean // 绘制外形时忽略stroke

    cellList?: ILeafList
}

export interface IRendererConfig {
    usePartRender?: boolean
    useCellRender?: boolean | IObject
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