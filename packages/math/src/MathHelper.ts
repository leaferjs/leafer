import { IPointData, IBoundsData, IMatrixData } from '@leafer/interface'

const { round, pow, PI } = Math

export const MathHelper = {

    within(value: number, min: number, max: number): number {
        if (min !== undefined && value < min) value = min
        if (max !== undefined && value > max) value = max
        return value
    },

    fourNumber(num: number | number[], maxValue?: number): number[] { // top right bottom left || topLeft, topRight, bottomRight, bottomLeft
        let data: number[]
        if (num instanceof Array) {
            switch (num.length) {
                case 4:
                    data = maxValue === undefined ? num : [...num]
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
        if (maxValue) for (let i = 0; i < 4; i++)  if (data[i] > maxValue) data[i] = maxValue
        return data
    },

    formatRotation(rotation: number, unsign?: boolean): number {
        rotation %= 360
        if (unsign) {
            if (rotation < 0) rotation += 360
        } else {
            if (rotation > 180) rotation -= 360
            if (rotation < -180) rotation += 360
        }
        return MathHelper.float(rotation)
    },

    getGapRotation(addRotation: number, gap: number, oldRotation: number = 0): number {
        let rotation = addRotation + oldRotation
        if (gap > 1) {
            const r = Math.abs(rotation % gap)
            if (r < 1 || r > gap - 1) rotation = Math.round(rotation / gap) * gap
        }
        return rotation - oldRotation
    },

    float(num: number, maxLength?: number): number {
        const a = maxLength ? pow(10, maxLength) : 1000000000000 // default
        num = round(num * a) / a
        return num === -0 ? 0 : num
    }

}

export const OneRadian = PI / 180
export const PI2 = PI * 2
export const PI_2 = PI / 2

export function getPointData(): IPointData { return { x: 0, y: 0 } }
export function getBoundsData(): IBoundsData { return { x: 0, y: 0, width: 0, height: 0 } }
export function getMatrixData(): IMatrixData { return { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 } }