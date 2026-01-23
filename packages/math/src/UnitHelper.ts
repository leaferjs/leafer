import { IUnitData } from '@leafer/interface'
import { isObject } from '@leafer/data'

export const UnitConvertHelper = {
    number(value: number | IUnitData, percentRefer?: number): number {
        return isObject(value) ? (value.type === 'percent' ? value.value * percentRefer : value.value) : value
    }
}