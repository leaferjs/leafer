import { IFunction } from '@leafer/interface'
import { Debug } from '@leafer/debug'

import { TaskItem } from './TaskItem'


const debug = Debug.get('TaskProcessor')


export interface ITaskProcessorParams {
    onComplete?: IFunction
    onTask?: IFunction
    onError?: IFunction
    parallel?: number
}


export class TaskProcessor {

    private parallel = 6
    private params: ITaskProcessorParams = {}

    // 需要初始化的动态数据
    private list: Array<TaskItem> = []
    private index = 0

    private parallelList: Array<TaskItem>
    private parallelSuccessNumber: number

    private _isComplete: boolean
    public get isComplete(): boolean {
        return this._isComplete
    }

    private _running: boolean
    public get running(): boolean {
        return this._running
    }

    constructor(params?: ITaskProcessorParams) {
        if (params) {
            this.params = params
            if (params.parallel) this.parallel = params.parallel
        }
        this.init()
    }

    get percent(): number {
        const len = this.list.length
        let totalTime = 0
        let runTime = 0
        for (let i = 0; i < len; i++) {
            if (i <= this.index) {
                runTime += this.list[i].taskTime
                if (i === this.index) totalTime = runTime
            } else {
                totalTime += this.list[i].taskTime
            }
        }

        let percent = this._isComplete ? 1 : (runTime / totalTime)
        if (Number.isNaN(percent)) percent = 0
        return percent

    }

    get total(): number {
        return this.list.length
    }

    get runIndex(): number {
        return this.index
    }

    protected init(): void {
        this.empty()
        this.index = 0
        this.parallelSuccessNumber = 0
        this._running = false
        this._isComplete = false
    }

    protected empty(): void {
        this.list = []
        this.parallelList = []
    }



    public start(): void {
        this._running = true
        this._isComplete = false
        this.run()
    }

    public pause(): void {
        this._running = false
    }

    public resume(): void {
        this._running = true
        this._isComplete = false
        this.run()
    }

    public skip(): void {
        this.index++
        this.resume()
    }

    public stop(): void {
        this._running = false
        this.list.forEach(item => {
            item.complete()
        })
        this.empty()
    }



    public add(taskCallback: IFunction, taskTime?: number): void {
        this.push(new TaskItem(taskCallback), taskTime)
    }

    public addParallel(taskCallback: IFunction, taskTime?: number): void {
        const task = new TaskItem(taskCallback)
        task.parallel = true
        this.push(task, taskTime)
    }

    public addEmpty(callback?: IFunction): void {
        this.push(new TaskItem(callback))
    }



    private push(task: TaskItem, taskTime?: number): void {
        if (taskTime) task.taskTime = taskTime
        task.parent = this
        this.list.push(task)
    }

    private run(): void {
        if (!this._running) return

        this.setParallelList()

        if (this.parallelList.length > 1) {

            this.runParallelTask()

        } else {

            this.runTask()

        }
    }

    protected runTask(): void {
        const task = this.list[this.index]
        task.run().then(() => {

            this.onTask(task)

            this.index++
            this.nextTask()

        }).catch(error => {
            this.onError(error)
        })
    }

    protected runParallelTask(): void {
        this.parallelList.forEach(task => {
            task.run().then(() => {

                this.onTask(task)
                this.fillParallelTask()
            }).catch(error => {
                this.onParallelError(error)
            })
        })
    }

    protected setParallelList(): void {
        let task: TaskItem

        this.parallelList = []
        this.parallelSuccessNumber = 0
        let end = this.index + this.parallel

        if (end > this.list.length) end = this.list.length

        for (let i = this.index; i < end; i++) {
            task = this.list[i]
            if (task.parallel) {
                this.parallelList.push(task)
            } else {
                break
            }
        }
    }


    protected fillParallelTask(): void {

        let task: TaskItem
        const parallelList = this.parallelList

        // 完成一个任务
        this.parallelSuccessNumber++
        parallelList.pop()

        // 找到下一个可以并行的任务
        const parallelWaitNumber = parallelList.length
        const nextIndex = this.index + this.parallelSuccessNumber + parallelWaitNumber

        if (parallelList.length) {

            if (!this._running) return

            if (nextIndex < this.list.length) {

                task = this.list[nextIndex]

                if (task.parallel) {

                    parallelList.push(task)

                    task.run().then(() => {

                        this.onTask(task)
                        this.fillParallelTask()
                    }).catch(error => {
                        this.onParallelError(error)
                    })

                }
            }

        } else {

            this.index += this.parallelSuccessNumber
            this.nextTask()

        }
    }

    private nextTask(): void {
        setTimeout(() => {
            this.run()
        }, 0)
    }

    private onComplete(): void {
        this.stop()
        this._isComplete = true
        if (this.params.onComplete) this.params.onComplete()
    }

    private onTask(task: TaskItem): void {
        task.complete()
        if (this.params.onTask) this.params.onTask()
        if (this.index === this.list.length - 1) this.onComplete()
    }

    private onParallelError(error: unknown): void {
        debug.error('ParallelError')

        // 并行变串行, 以便下次重试
        this.parallelList.forEach(task => {
            task.parallel = false
        })
        this.parallelList.length = 0
        this.parallelSuccessNumber = 0

        this.onError(error)
    }

    private onError(error: unknown): void {
        this.pause()
        if (this.params.onError) this.params.onError(error)
    }
}