import { IPointData, IBoundsData, IMatrixData, IRangeSize, IScaleData, ISizeData, IOptionSizeData } from '@leafer/interface'
import { isArray, isObject, isNumber, isUndefined } from '@leafer/data'

const { round, pow, PI } = Math

export const MathHelper = {

    within(value: number, min: number | IRangeSize, max?: number): number {
        if (isObject(min)) max = min.max, min = min.min
        if (!isUndefined(min) && value < min) value = min
        if (!isUndefined(max) && value > max) value = max
        return value
    },

    fourNumber(num: number | number[], maxValue?: number): number[] { // top right bottom left || topLeft, topRight, bottomRight, bottomLeft
        let data: number[]
        if (isArray(num)) {
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
        const a = !isUndefined(maxLength) ? pow(10, maxLength) : 1000000000000 // default
        num = round(num * a) / a
        return num === -0 ? 0 : num
    },

    getScaleData(scale: number | IPointData, size: number | IOptionSizeData, originSize: ISizeData, scaleData?: IScaleData): IScaleData {
        if (!scaleData) scaleData = {} as IScaleData
        if (size) {
            const scaleX = (isNumber(size) ? size : size.width || 0) / originSize.width, scaleY = (isNumber(size) ? size : size.height || 0) / originSize.height
            scaleData.scaleX = scaleX || scaleY || 1
            scaleData.scaleY = scaleY || scaleX || 1
        } else if (scale) MathHelper.assignScale(scaleData, scale)
        return scaleData
    },

    assignScale(scaleData: IScaleData, scale: number | IPointData): void {
        if (isNumber(scale)) {
            scaleData.scaleX = scaleData.scaleY = scale
        } else {
            scaleData.scaleX = scale.x
            scaleData.scaleY = scale.y
        }
    },

    randInt,

    randColor(opacity?: number): string {
        return `rgba(${randInt(255)},${randInt(255)},${randInt(255)},${opacity || 1})`
    }
}

function randInt(num: number): number {
    return Math.round(Math.random() * num)
}

export const OneRadian = PI / 180
export const PI2 = PI * 2
export const PI_2 = PI / 2

export function getPointData(): IPointData { return { x: 0, y: 0 } }
export function getBoundsData(): IBoundsData { return { x: 0, y: 0, width: 0, height: 0 } }
export function getMatrixData(): IMatrixData { return { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 } }