import { ILeaferCanvas, IRenderOptions, ILeafRenderModule } from '@leafer/interface'
import { LeafHelper } from '@leafer/helper'
import { Debug } from '@leafer/debug'


export const LeafRender: ILeafRenderModule = {

    __render(canvas: ILeaferCanvas, options: IRenderOptions): void {

        if (options.shape) return this.__renderShape(canvas, options)

        if (this.__worldOpacity) {

            const data = this.__

            if (data.bright && !options.topRendering) return options.topList.add(this)

            canvas.setWorld(this.__nowWorld = this.__getNowWorld(options))
            canvas.opacity = options.dimOpacity && !data.dimskip ? data.opacity * options.dimOpacity : data.opacity

            if (this.__.__single) {

                if (data.eraser === 'path') return this.__renderEraser(canvas, options)

                const tempCanvas = canvas.getSameCanvas(true, true)
                this.__draw(tempCanvas, options, canvas)

                LeafHelper.copyCanvasByWorld(this, canvas, tempCanvas, this.__nowWorld, data.__blendMode, true)

                tempCanvas.recycle(this.__nowWorld)

            } else {

                this.__draw(canvas, options)

            }

            if (Debug.showBounds) Debug.drawBounds(this, canvas, options)

        }
    },

    __renderShape(canvas: ILeaferCanvas, options: IRenderOptions): void {
        if (this.__worldOpacity) {
            canvas.setWorld(this.__nowWorld = this.__getNowWorld(options))

            this.__drawShape(canvas, options)
        }
    },

    __clip(canvas: ILeaferCanvas, options: IRenderOptions): void {
        if (this.__worldOpacity) {
            canvas.setWorld(this.__nowWorld = this.__getNowWorld(options))
            this.__drawRenderPath(canvas)
            canvas.clipUI(this)
        }
    },

    __updateWorldOpacity(): void {
        this.__worldOpacity = this.__.visible ? (this.parent ? this.parent.__worldOpacity * this.__.opacity : this.__.opacity) : 0
        if (this.__layout.opacityChanged) this.__layout.opacityChanged = false
    }

}