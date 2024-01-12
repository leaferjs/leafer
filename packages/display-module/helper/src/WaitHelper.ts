import { IFunction } from '@leafer/interface'

export const WaitHelper = {
    run(wait: IFunction[]): void {
        if (wait.length) {
            const len = wait.length
            for (let i = 0; i < len; i++) { wait[i]() }
            wait.length === len ? wait.length = 0 : wait.splice(0, len)
        }
    }
}