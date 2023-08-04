import { IMultiTouchData, IKeepTouchData } from '@leafer/interface'
import { PointHelper } from '@leafer/math'


export const MultiTouchHelper = {

    getData(list: IKeepTouchData[]): IMultiTouchData {
        const a = list[0]
        const b = list[1]
        const lastCenter = PointHelper.getCenter(a.from, b.from)
        const center = PointHelper.getCenter(a.to, b.to)
        const move = { x: center.x - lastCenter.x, y: center.y - lastCenter.y }

        const lastDistance = PointHelper.getDistance(a.from, b.from)
        const distance = PointHelper.getDistance(a.to, b.to)
        const scale = distance / lastDistance

        const lastAngle = PointHelper.getAngle(a.from, b.from)
        const currentAngle = PointHelper.getAngle(a.to, b.to)
        const angle = this.getChangedAngle(lastAngle, currentAngle)

        return { move, scale, angle, center }
    },

    getChangedAngle(from: number, to: number): number {
        from = from <= -90 ? (360 + from) : from
        to = to <= -90 ? (360 + to) : to

        const angle = to - from
        return angle < 0 ? angle + 360 : angle
    }

}