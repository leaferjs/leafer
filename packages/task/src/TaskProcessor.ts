import { IFunction, ITaskProcessor, ITaskProcessorConfig, ITaskOptions, ITaskItem } from '@leafer/interface'
import { DataHelper, isNumber, isUndefined } from '@leafer/data'

import { TaskItem } from './TaskItem'


export class TaskProcessor implements ITaskProcessor {

    public config: ITaskProcessorConfig = { parallel: 6 }

    protected list: ITaskItem[] = []

    protected parallelList: ITaskItem[]
    protected parallelSuccessNumber: number

    public running = false
    public isComplete = true

    protected timer: any

    public get total(): number { return this.list.length + this.delayNumber }

    public index = 0

    public delayNumber = 0 // 延迟执行任务

    public get finishedIndex(): number {
        return this.isComplete ? 0 : this.index + this.parallelSuccessNumber
    }

    public get remain(): number {
        return this.isComplete ? this.total : this.total - this.finishedIndex
    }

    public get percent(): number {
        const { total } = this
        let totalTime = 0, runTime = 0

        for (let i = 0; i < total; i++) {
            if (i <= this.finishedIndex) {
                runTime += this.list[i].time
                if (i === this.finishedIndex) totalTime = runTime
            } else {
                totalTime += this.list[i].time
            }
        }

        return this.isComplete ? 1 : (runTime / totalTime)
    }


    constructor(config?: ITaskProcessorConfig) {
        if (config) DataHelper.assign(this.config, config)
        this.empty()
    }

    // list

    public add(taskCallback: IFunction, options?: ITaskOptions | number, canUse?: IFunction): ITaskItem {
        let start: boolean, parallel: boolean, time: number, delay: number

        const task = new TaskItem(taskCallback)
        task.parent = this

        if (isNumber(options)) {
            delay = options
        } else if (options) {
            parallel = options.parallel
            start = options.start
            time = options.time
            delay = options.delay
            if (!canUse) canUse = options.canUse
        }

        if (time) task.time = time
        if (parallel === false) task.parallel = false
        if (canUse) task.canUse = canUse

        if (isUndefined(delay)) {
            this.push(task, start)
        } else {
            this.delayNumber++
            setTimeout(() => {
                if (this.delayNumber) {
                    this.delayNumber--
                    this.push(task, start)
                }
            }, delay)
        }

        this.isComplete = false

        return task
    }

    protected push(task: ITaskItem, start?: boolean): void {
        this.list.push(task)
        if (start !== false && !this.timer) {
            this.timer = setTimeout(() => this.start())
        }
    }

    protected empty(): void {
        this.index = 0
        this.parallelSuccessNumber = 0
        this.list = []
        this.parallelList = []
        this.delayNumber = 0
    }

    // control

    public start(): void {
        if (!this.running) {
            this.running = true
            this.isComplete = false
            this.run()
        }
    }

    public pause(): void {
        clearTimeout(this.timer)
        this.timer = null
        this.running = false
    }

    public resume(): void {
        this.start()
    }

    public skip(): void {
        this.index++
        this.resume()
    }

    public stop(): void {
        this.isComplete = true
        this.list.forEach(task => { if (!task.isComplete) task.run() })
        this.pause()
        this.empty()
    }

    // run 

    protected run(): void {
        if (!this.running) return

        this.setParallelList()

        if (this.parallelList.length > 1) {

            this.runParallelTasks()

        } else {

            this.remain ? this.runTask() : this.onComplete()

        }
    }

    protected runTask(): void {
        const task = this.list[this.index]
        if (!task) {
            this.timer = setTimeout(() => this.nextTask())  // 存在延时任务
            return
        }

        task.run().then(() => {

            this.onTask(task)

            this.index++
            task.isCancel ? this.runTask() : this.nextTask()

        }).catch(error => {
            this.onError(error)
        })
    }

    protected runParallelTasks(): void {
        this.parallelList.forEach(task => this.runParallelTask(task))
    }

    protected runParallelTask(task: ITaskItem): void {
        task.run().then(() => {

            this.onTask(task)
            this.fillParallelTask()

        }).catch(error => {
            this.onParallelError(error)
        })
    }

    private nextTask(): void {
        if (this.total === this.finishedIndex) {
            this.onComplete()
        } else {
            this.timer = setTimeout(() => this.run())
        }
    }

    protected setParallelList(): void {
        let task: ITaskItem
        const { config, list, index } = this

        this.parallelList = []
        this.parallelSuccessNumber = 0
        let end = index + config.parallel

        if (end > list.length) end = list.length

        if (config.parallel > 1) {
            for (let i = index; i < end; i++) {
                task = list[i]
                if (task.parallel) this.parallelList.push(task)
                else break
            }
        }
    }


    protected fillParallelTask(): void {
        let task: ITaskItem
        const parallelList = this.parallelList

        // 完成一个任务
        this.parallelSuccessNumber++
        parallelList.pop()

        // 找到下一个可以并行的任务
        const parallelWaitNumber = parallelList.length
        const nextIndex = this.finishedIndex + parallelWaitNumber

        if (parallelList.length) {

            if (!this.running) return

            if (nextIndex < this.total) {

                task = this.list[nextIndex]

                if (task && task.parallel) {
                    parallelList.push(task)
                    this.runParallelTask(task)
                }

            }

        } else {

            this.index += this.parallelSuccessNumber
            this.parallelSuccessNumber = 0
            this.nextTask()

        }
    }

    // event

    protected onComplete(): void {
        this.stop()
        if (this.config.onComplete) this.config.onComplete()
    }

    protected onTask(task: ITaskItem): void {
        task.complete()
        if (this.config.onTask) this.config.onTask()
    }

    protected onParallelError(error: unknown): void {
        // 并行变串行, 以便下次重试
        this.parallelList.forEach(task => {
            task.parallel = false
        })
        this.parallelList.length = 0
        this.parallelSuccessNumber = 0

        this.onError(error)
    }

    protected onError(error: unknown): void {
        this.pause()
        if (this.config.onError) this.config.onError(error)
    }

    public destroy(): void {
        this.stop()
    }
}