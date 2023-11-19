import { IPathDrawer } from '@leafer/interface'
import { MathHelper } from '@leafer/math'

export const RectHelper = {

    drawRoundRect(drawer: IPathDrawer, x: number, y: number, width: number, height: number, cornerRadius: number | number[]): void {
        const data = MathHelper.fourNumber(cornerRadius, Math.min(width / 2, height / 2))

        const right = x + width
        const bottom = y + height

        data[0] ? drawer.moveTo(x + data[0], y) : drawer.moveTo(x, y)
        data[1] ? drawer.arcTo(right, y, right, bottom, data[1]) : drawer.lineTo(right, y)
        data[2] ? drawer.arcTo(right, bottom, x, bottom, data[2]) : drawer.lineTo(right, bottom)
        data[3] ? drawer.arcTo(x, bottom, x, y, data[3]) : drawer.lineTo(x, bottom)
        data[0] ? drawer.arcTo(x, y, right, y, data[0]) : drawer.lineTo(x, y)
    }

}