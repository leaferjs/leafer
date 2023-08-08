import { canvasPatch } from '@leafer/canvas'

export { LeaferCanvas } from './LeaferCanvas'

canvasPatch(CanvasRenderingContext2D.prototype)
canvasPatch(Path2D.prototype)