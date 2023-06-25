import { IPathDrawer } from '@leafer/interface'
import { MathHelper } from '@leafer/math'

export const RectHelper = {

    drawRoundRect(drawer: IPathDrawer, x: number, y: number, width: number, height: number, cornerRadius: number | number[]): void {
        let [topLeft, topRight, bottomRight, bottomLeft] = MathHelper.fourNumber(cornerRadius)

        const max = Math.min(width / 2, height / 2)
        if (topLeft > max) topLeft = max
        if (topRight > max) topRight = max
        if (bottomRight > max) bottomRight = max
        if (bottomLeft > max) bottomLeft = max

        topLeft ? drawer.moveTo(x + topLeft, y) : drawer.moveTo(x, y)
        topRight ? drawer.arcTo(x + width, y, x + width, y + height, topRight) : drawer.lineTo(x + width, y)
        bottomRight ? drawer.arcTo(x + width, y + height, x, y + height, bottomRight) : drawer.lineTo(x + width, y + height)
        bottomLeft ? drawer.arcTo(x, y + height, x, y, bottomLeft) : drawer.lineTo(x, y + height)
        topLeft ? drawer.arcTo(x, y, x + width, y, topLeft) : drawer.lineTo(x, y)
    }

}