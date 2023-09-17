import { canvasPatch } from '@leafer/core'

export { LeaferCanvas } from './LeaferCanvas'

canvasPatch(OffscreenCanvasRenderingContext2D.prototype)
canvasPatch(Path2D.prototype)