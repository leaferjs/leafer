import { IPointData, IBoundsData, IMatrixData, IRangeSize, IScaleData, ISizeData, IOptionSizeData, IScaleFixed } from '@leafer/interface'
import { isObject, isNumber, isUndefined } from '@leafer/data'
import { FourNumberHelper } from './FourNumberHelper'


const { round, pow, max, floor, PI } = Math
const tempScaleData = {} as IScaleData

export const MathHelper = {

    within(value: number, min: number | IRangeSize, max?: number): number {
        if (isObject(min)) max = min.max, min = min.min
        if (!isUndefined(min) && value < min) value = min
        if (!isUndefined(max) && value > max) value = max
        return value
    },

    fourNumber: FourNumberHelper.get,

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

    sign(num: number): number {
        return num < 0 ? -1 : 1
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

    // 返回结果必须马上分解使用
    getScaleFixedData(worldScaleData?: IScaleData, scaleFixed?: IScaleFixed, unscale?: boolean, abs?: boolean, _localScaleData?: IScaleData): IScaleData {
        let { scaleX, scaleY } = worldScaleData
        if (abs || scaleFixed) scaleX < 0 && (scaleX = -scaleX), scaleY < 0 && (scaleY = -scaleY)
        if (scaleFixed) {
            if (scaleFixed === true) {
                scaleX = scaleY = unscale ? 1 : 1 / scaleX
            } else {
                let minScale: number
                if (isNumber(scaleFixed)) minScale = scaleFixed
                else if (scaleFixed === 'zoom-in') minScale = 1

                if (minScale) {
                    if (scaleX > minScale || scaleY > minScale) scaleX = scaleY = unscale ? 1 : 1 / scaleX
                    else scaleX = scaleY = unscale ? 1 : 1 / minScale
                }
            }
        }
        tempScaleData.scaleX = scaleX
        tempScaleData.scaleY = scaleY
        return tempScaleData
    },

    assignScale(scaleData: IScaleData, scale: number | IPointData): void {
        if (isNumber(scale)) {
            scaleData.scaleX = scaleData.scaleY = scale
        } else {
            scaleData.scaleX = scale.x
            scaleData.scaleY = scale.y
        }
    },

    getFloorScale(num: number, min = 1): number {
        return max(floor(num), min) / num
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