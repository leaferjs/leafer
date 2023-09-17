import { canvasPatch } from '@leafer/core'

export { LeaferCanvas } from './LeaferCanvas'

canvasPatch(CanvasRenderingContext2D.prototype)
canvasPatch(Path2D.prototype)