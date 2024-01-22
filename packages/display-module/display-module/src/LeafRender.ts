import { ILeaferCanvas, IRenderOptions, ILeafRenderModule } from '@leafer/interface'


export const LeafRender: ILeafRenderModule = {

    __render(canvas: ILeaferCanvas, options: IRenderOptions): void {
        if (this.__worldOpacity) {

            canvas.setWorld(this.__nowWorld = this.__getRenderWorld(options))
            canvas.opacity = this.__.opacity

            if (this.__.__single) {

                const tempCanvas = canvas.getSameCanvas(true, true)
                this.__draw(tempCanvas, options)

                if (this.__worldFlipped) {
                    canvas.copyWorldByReset(tempCanvas, this.__nowWorld, null, this.__.__blendMode, true)
                } else {
                    canvas.copyWorldToInner(tempCanvas, this.__nowWorld, this.__layout.renderBounds, this.__.__blendMode)
                }

                tempCanvas.recycle(this.__nowWorld)

            } else {

                this.__draw(canvas, options)

            }

        }
    },

    __clip(canvas: ILeaferCanvas, options: IRenderOptions): void {
        if (this.__worldOpacity) {
            canvas.setWorld(this.__nowWorld = this.__getRenderWorld(options))
            this.__drawRenderPath(canvas)
            this.__.windingRule ? canvas.clip(this.__.windingRule) : canvas.clip()
        }
    },

    __updateWorldOpacity(): void {
        this.__worldOpacity = this.__.visible ? (this.parent ? this.parent.__worldOpacity * this.__.opacity : this.__.opacity) : 0
        if (this.__layout.opacityChanged) this.__layout.opacityChanged = false
    }

}