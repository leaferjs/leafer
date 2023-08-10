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
    add(taskCallback: IFunction, taskTime?: number, start?: boolean): void
    addParallel(taskCallback: IFunction, taskTime?: number, start?: boolean,): void
    addEmpty(callback?: IFunction): void
    destroy(): void
}