import { IFunction } from '@leafer/interface'
import { IncrementId } from '@leafer/math'
import { Debug } from '@leafer/debug'

import { TaskProcessor } from './TaskProcessor'


const debug = Debug.get('TaskProcessor')
export class TaskItem {

    readonly id: number

    public parent: TaskProcessor

    public parallel: boolean
    public isComplete: boolean

    private task: IFunction

    public taskTime = 1 // 预估任务需要运行的时间， 毫秒为单位

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

}