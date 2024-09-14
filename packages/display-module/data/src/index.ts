import { IObject } from '@leafer/interface'

export { DataHelper } from './DataHelper'
export { LeafData } from './LeafData'

export enum Answer {
    No = 0,
    Yes = 1,
    NoAndSkip = 2,
    YesAndSkip = 3
}

export const emptyData: IObject = {}

export function isNull(value: any): boolean {
    return value === undefined || value === null
}