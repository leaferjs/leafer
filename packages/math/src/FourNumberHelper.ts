import { IFourNumber } from '@leafer/interface'
import { isNumber, isUndefined } from '@leafer/data'


let tempA: number[], tempB: number[], tempTo: number[]
const { max } = Math, tempFour = [0, 0, 0, 0]

export const FourNumberHelper = {

    zero: [...tempFour],

    tempFour,

    set(to: number[], top: number, right?: number, bottom?: number, left?: number): number[] {
        if (right === undefined) right = bottom = left = top
        to[0] = top
        to[1] = right
        to[2] = bottom
        to[3] = left
        return to
    },

    setTemp(top: number, right?: number, bottom?: number, left?: number) {
        return set(tempFour, top, right, bottom, left)
    },

    toTempAB(a: IFourNumber, b: IFourNumber, change?: boolean): void {
        tempTo = change ? (isNumber(a) ? b : a) as number[] : []
        if (isNumber(a)) tempA = setTemp(a), tempB = b as number[]
        else if (isNumber(b)) tempA = a, tempB = setTemp(b)
        else tempA = a, tempB = b

        if (tempA.length !== 4) tempA = get(tempA)
        if (tempB.length !== 4) tempB = get(tempB)
    },

    get(num: IFourNumber, maxValue?: number): number[] { // top right bottom left || topLeft, topRight, bottomRight, bottomLeft
        let data: number[]
        if (!isNumber(num)) {
            switch (num.length) {
                case 4:
                    data = isUndefined(maxValue) ? num : [...num]
                    break
                case 2:
                    data = [num[0], num[1], num[0], num[1]]
                    break
                case 3:
                    data = [num[0], num[1], num[2], num[1]]
                    break
                case 1:
                    num = num[0]
                    break
                default:
                    num = 0
            }
        }
        if (!data) data = [num as number, num as number, num as number, num as number]
        if (!isUndefined(maxValue)) for (let i = 0; i < 4; i++)  if (data[i] > maxValue) data[i] = maxValue
        return data
    },

    max(t: IFourNumber, other: IFourNumber, change?: boolean): IFourNumber {
        if (isNumber(t) && isNumber(other)) return max(t, other)

        toTempAB(t, other, change)

        return set(
            tempTo,
            max(tempA[0], tempB[0]),
            max(tempA[1], tempB[1]),
            max(tempA[2], tempB[2]),
            max(tempA[3], tempB[3])
        )
    },

    add(t: IFourNumber, other: IFourNumber, change?: boolean): IFourNumber {
        if (isNumber(t) && isNumber(other)) return t + other

        toTempAB(t, other, change)

        return set(
            tempTo,
            tempA[0] + tempB[0],
            tempA[1] + tempB[1],
            tempA[2] + tempB[2],
            tempA[3] + tempB[3]
        )
    },

    swapAndScale(t: IFourNumber, scaleX: number, scaleY: number, change?: boolean): IFourNumber { // 反向交换并缩放
        if (isNumber(t)) return scaleX === scaleY ? t * scaleX : [t * scaleY, t * scaleX]

        const to = change ? t : []
        const [top, right, bottom, left] = t.length === 4 ? t : get(t)

        return set(
            to,
            bottom * scaleY,
            left * scaleX,
            top * scaleY,
            right * scaleX
        )
    }

}

const { set, get, setTemp, toTempAB } = FourNumberHelper