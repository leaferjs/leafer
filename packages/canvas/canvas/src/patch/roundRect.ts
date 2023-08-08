import { IPathDrawer } from '@leafer/interface'
import { RectHelper } from '@leafer/path'


const { drawRoundRect } = RectHelper

export function roundRect(drawer: IPathDrawer): void {

    if (drawer && !drawer.roundRect) {

        drawer.roundRect = function (x: number, y: number, width: number, height: number, cornerRadius: number | number[]): void {

            drawRoundRect(this as IPathDrawer, x, y, width, height, cornerRadius)
        }
    }

}

