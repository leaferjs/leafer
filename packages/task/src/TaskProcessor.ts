import { IFunction, ITaskProcessor, ITaskProcessorConfig } from '@leafer/interface'
import { DataHelper } from '@leafer/data'
import { Debug } from '@leafer/debug'

import { TaskItem } from './TaskItem'


const debug = Debug.get('TaskProcessor')

export class TaskProcessor implements ITaskProcessor {

    public config: ITaskProcessorConfig = { parallel: 6 }

    private list: Array<TaskItem> = []

    private parallelList: Array<TaskItem>
    private parallelSuccessNumber: number

    public get isComplete(): boolean { return this._isComplete }
    private _isComplete: boolean

    public get running(): boolean { return this._running }
    private _running: boolean
    private _timer: any

    public get percent(): number {
        const { total } = this
        let totalTime = 0, runTime = 0

        for (let i = 0; i < total; i++) {
            if (i <= this.finishedIndex) {
                runTime += this.list[i].taskTime
                if (i === this.finishedIndex) totalTime = runTime
            } else {
                totalTime += this.list[i].taskTime
            }
        }

        return this._isComplete ? 1 : (runTime / totalTime)
    }

    public get total(): number {
        return this.list.length
    }

    public index = 0

    public get finishedIndex(): number {
        return this._isComplete ? 0 : this.index + this.parallelSuccessNumber
    }

    public get remain(): number {
        return this._isComplete ? this.total : this.total - this.finishedIndex
    }


    constructor(config?: ITaskProcessorConfig) {
        if (config) DataHelper.assign(this.config, config)
        this.init()
    }

    protected init(): void {
        this.empty()
        this._running = false
        this._isComplete = true
    }

    protected empty(): void {
        this.index = 0
        this.parallelSuccessNumber = 0
        this.list = []
        this.parallelList = []
    }

    public start(): void {
        this._running = true
        this._isComplete = false
        this.run()
    }

    public pause(): void {
        clearTimeout(this._timer)
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
        clearTimeout(this._timer)
        this._running = false
        this._isComplete = true
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

            this.remain ? this.runTask() : this.onComplete()

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
        let end = this.index + this.config.parallel

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
        const nextIndex = this.finishedIndex + parallelWaitNumber

        if (parallelList.length) {

            if (!this._running) return

            if (nextIndex < this.total) {

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
            this.parallelSuccessNumber = 0
            this.nextTask()

        }
    }

    private nextTask(): void {
        if (this.total === this.finishedIndex) {
            this.onComplete()
        } else {
            this._timer = setTimeout(() => this.run(), 0)
        }
    }

    private onComplete(): void {
        this.stop()
        if (this.config.onComplete) this.config.onComplete()
    }

    private onTask(task: TaskItem): void {
        task.complete()
        if (this.config.onTask) this.config.onTask()
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
        if (this.config.onError) this.config.onError(error)
    }

    public destory(): void {
        this.empty()
        this.config = {}
    }
}