import { canvasPatch } from '@leafer/canvas'

export { LeaferCanvas } from './LeaferCanvas'

canvasPatch(OffscreenCanvasRenderingContext2D.prototype)
canvasPatch(Path2D.prototype)