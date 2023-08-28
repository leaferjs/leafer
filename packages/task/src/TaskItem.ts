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

    private task: IFunction

    constructor(task?: IFunction) {
        this.id = IncrementId.create(IncrementId.TASK)
        this.task = task
    }

    async run(): Promise<void> {
        try {
            if (this.task && !this.isComplete && this.parent.running) await this.task()
        } catch (error) {
            debug.error(error)
        }
    }

    public complete(): void {
        this.isComplete = true
        this.parent = null
        this.task = null
    }

    public cancel(): void {
        this.isCancel = true
        this.complete()
    }

}