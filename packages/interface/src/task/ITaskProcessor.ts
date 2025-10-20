import { IFunction } from '../function/IFunction'

export interface ITaskProcessorConfig {
    onComplete?: IFunction
    onTask?: IFunction
    onError?: IFunction
    parallel?: number
}

export interface ITaskProcessor {
    config: ITaskProcessorConfig
    running: boolean
    isComplete: boolean
    percent: number
    total: number
    index: number
    finishedIndex: number
    remain: number
    start(): void
    pause(): void
    resume(): void
    skip(): void
    stop(): void
    add(taskCallback: IFunction, options?: ITaskOptions | number, canUse?: IFunction): ITaskItem
    destroy(): void
}

export interface ITaskItem {
    parent: ITaskProcessor
    parallel: boolean
    isComplete: boolean
    isCancel: boolean
    time: number
    canUse?: IFunction
    run(): Promise<void>
    complete(): void
    cancel(): void
}

export interface ITaskOptions {
    start?: boolean // default true
    time?: number // default 1
    parallel?: boolean // default true
    delay?: number // default 0
    canUse?: IFunction
}