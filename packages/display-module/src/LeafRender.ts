import { ILeaferCanvas, IRenderOptions, ILeafRenderModule } from '@leafer/interface'


export const LeafRender: ILeafRenderModule = {

    __render(canvas: ILeaferCanvas, options: IRenderOptions): void {
        if (this.__worldOpacity) {
            canvas.setWorld(this.__world, options.matrix)
            canvas.opacity = this.__worldOpacity

            if (this.__.__single) {
                const tempCanvas = canvas.getSameCanvas(true)

                this.__draw(tempCanvas, options)

                canvas.copyWorldToInner(tempCanvas, this.__world, this.__layout.renderBounds, this.__.blendMode)
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