import { IPathDrawer } from '@leafer/interface'

import { roundRect } from './roundRect'

export function canvasPatch(drawer: IPathDrawer): void {
    roundRect(drawer)
}