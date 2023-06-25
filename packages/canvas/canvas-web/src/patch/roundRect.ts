import { IObject, IPathDrawer } from '@leafer/interface'
import { RectHelper } from '@leafer/path'


const { drawRoundRect } = RectHelper

export function roundRect(): void {

    const canvas = CanvasRenderingContext2D.prototype as IPathDrawer

    if (!canvas.roundRect) {

        canvas.roundRect = (Path2D.prototype as IObject).roundRect = function (x: number, y: number, width: number, height: number, cornerRadius: number | number[]): void {

            drawRoundRect(this as IPathDrawer, x, y, width, height, cornerRadius)
        }
    }

}

