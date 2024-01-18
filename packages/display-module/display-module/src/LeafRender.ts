import { ILeaferCanvas, IRenderOptions, ILeafRenderModule } from '@leafer/interface'


export const LeafRender: ILeafRenderModule = {

    __render(canvas: ILeaferCanvas, options: IRenderOptions): void {
        if (this.__worldOpacity) {
            canvas.setWorld(this.__world, options.matrix)
            canvas.opacity = this.__.opacity

            if (this.__.__single) {
                const tempCanvas = canvas.getSameCanvas(true, true)

                this.__draw(tempCanvas, options)

                if (this.__worldFlipped || options.matrix) {
                    canvas.copyWorldByReset(tempCanvas, null, null, this.__.__blendMode, true)
                } else {
                    canvas.copyWorldToInner(tempCanvas, this.__world, this.__layout.renderBounds, this.__.__blendMode)
                }

                tempCanvas.recycle()
            } else {
                this.__draw(canvas, options)
            }
        }
    },

    __updateWorldOpacity(): void {
        this.__worldOpacity = this.__.visible ? (this.parent ? this.parent.__worldOpacity * this.__.opacity : this.__.opacity) : 0
        if (this.__layout.opacityChanged) this.__layout.opacityChanged = false
    }

}