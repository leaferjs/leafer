import { ICanvasDrawPath } from '@leafer/interface'


export function roundRect(): void {

    if (!(CanvasRenderingContext2D.prototype as ICanvasDrawPath).roundRect) {

        (CanvasRenderingContext2D.prototype as ICanvasDrawPath).roundRect = (Path2D.prototype as ICanvasDrawPath).roundRect = function (x: number, y: number, w: number, h: number, r: number | number[]): void {

            let topLeft: number, topRight: number, bottomRight: number, bottomLeft: number

            if (r instanceof Array) {
                switch (r.length) {
                    case 4:
                        topLeft = r[0]
                        topRight = r[1]
                        bottomRight = r[2]
                        bottomLeft = r[3]
                        break
                    case 2:
                        topLeft = bottomRight = r[0]
                        topRight = bottomLeft = r[1]
                        break
                    case 3:
                        topLeft = r[0]
                        topRight = bottomLeft = r[1]
                        bottomRight = r[2]
                        break
                    case 1:
                        r = r[0]
                        break
                    default:
                        r = 0
                }
            }

            if (topLeft === undefined) {
                if (r) {
                    topLeft = topRight = bottomRight = bottomLeft = r as number
                } else {
                    this.rect(x, y, w, h)
                    return
                }
            }

            const max = Math.min(w / 2, h / 2)
            if (topLeft > max) topLeft = max
            if (topRight > max) topRight = max
            if (bottomRight > max) bottomRight = max
            if (bottomLeft > max) bottomLeft = max

            const R = this
            topLeft ? R.moveTo(x + topLeft, y) : R.moveTo(x, y)
            topRight ? R.arcTo(x + w, y, x + w, y + h, topRight) : R.lineTo(x + w, y)
            bottomRight ? R.arcTo(x + w, y + h, x, y + h, bottomRight) : R.lineTo(x + w, y + h)
            bottomLeft ? R.arcTo(x, y + h, x, y, bottomLeft) : R.lineTo(x, y + h)
            topLeft ? R.arcTo(x, y, x + w, y, topLeft) : R.lineTo(x, y)
            R.closePath()
        }
    }

}

