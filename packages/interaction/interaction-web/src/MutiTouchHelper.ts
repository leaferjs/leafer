import { IPointData } from '@leafer/interface'
import { PointHelper } from '@leafer/math'


export interface IMutiltouchData {
    move: IPointData,
    scale: number,
    angle: number,
    center: IPointData
}


export const MutiTouchHelper = {

    getData(from: Array<IPointData>, to: Array<IPointData>): IMutiltouchData {
        const lastCenter = PointHelper.getCenter(from[0], from[1])
        const center = PointHelper.getCenter(to[0], to[1])
        const move = { x: center.x - lastCenter.x, y: center.y - lastCenter.y }

        const lastDistance = PointHelper.getDistance(from[0], from[1])
        const distance = PointHelper.getDistance(to[0], to[1])
        const scale = distance / lastDistance

        const lastAngle = PointHelper.getAngle(from[0], from[1])
        const currentAngle = PointHelper.getAngle(to[0], to[1])
        const angle = this.getChangedAngle(lastAngle, currentAngle)

        return { move, scale, angle, center }
    },

    getTouches(touches: TouchList): Array<Touch> {
        const list: Array<Touch> = []
        for (let i = 0, len = touches.length; i < len; i++) {
            list.push(touches[i])
        }
        return list
    },

    getChangedAngle(from: number, to: number): number {
        from = from <= -90 ? (360 + from) : from
        to = to <= -90 ? (360 + to) : to

        const angle = to - from
        return angle < 0 ? angle + 360 : angle
    }

}