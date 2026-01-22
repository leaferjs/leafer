import { IFunction, ITaskItem } from '@leafer/interface'
import { IncrementId } from '@leafer/math'
import { Debug } from '@leafer/debug'

import { TaskProcessor } from './TaskProcessor'


const debug = Debug.get('TaskProcessor')
export class TaskItem implements ITaskItem {

    readonly id: number

    public parent: TaskProcessor

    public parallel = true
    public time = 1 // 预估任务需要运行的时间， 毫秒为单位

    public isComplete: boolean
    public isCancel: boolean
    public runing: boolean

    public canUse?: IFunction

    public task: IFunction

    constructor(task?: IFunction) {
        this.id = IncrementId.create(IncrementId.TASK)
        this.task = task
    }

    async run(): Promise<void> {
        try {
            if (this.isComplete || this.runing) return
            this.runing = true
            if (this.canUse && !this.canUse()) return this.cancel()
            if (this.task) await this.task()
        } catch (error) {
            debug.error(error)
        }
    }

    public complete(): void {
        this.isComplete = true
        this.parent = this.task = this.canUse = null
    }

    public cancel(): void {
        this.isCancel = true
        this.complete()
    }

}