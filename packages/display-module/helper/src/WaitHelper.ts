import { IFunction } from '@leafer/interface'

export const WaitHelper = {
    run(wait: IFunction[]): void {
        for (let i = 0, len = wait.length; i < len; i++) { wait[i]() }
        wait.length = 0
    }
}