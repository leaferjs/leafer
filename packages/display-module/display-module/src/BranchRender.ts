import { LeafBoundsHelper } from '@leafer/helper'
import { ILeaferCanvas, IRenderOptions, IBranchRenderModule } from '@leafer/interface'


const { excludeRenderBounds } = LeafBoundsHelper

export const BranchRender: IBranchRenderModule = {

    __updateChange(): void {
        const { __layout: layout } = this
        if (layout.childrenSortChanged) {
            this.__updateSortChildren()
            layout.childrenSortChanged = false
        }

        this.__.__checkSingle()
    },


    __render(canvas: ILeaferCanvas, options: IRenderOptions): void {
        if (this.__worldOpacity) {

            if (this.__.__single) {

                const tempCanvas = canvas.getSameCanvas(false, true)
                this.__renderBranch(tempCanvas, options)

                const realBounds = this.__getRenderWorld(options, true)

                canvas.opacity = this.__.opacity
                canvas.copyWorldByReset(tempCanvas, realBounds, realBounds, this.__.__blendMode, true)

                tempCanvas.recycle(realBounds)

            } else {

                if (this.__hasMask) {

                    this.__renderMask(canvas, options)

                } else {

                    const { children } = this
                    for (let i = 0, len = children.length; i < len; i++) {
                        if (excludeRenderBounds(children[i], options)) continue
                        children[i].__render(canvas, options)
                    }

                }

            }

        }
    },

    __clip(canvas: ILeaferCanvas, options: IRenderOptions): void {
        if (this.__worldOpacity) {
            const { children } = this
            for (let i = 0, len = children.length; i < len; i++) {
                if (excludeRenderBounds(children[i], options)) continue
                children[i].__clip(canvas, options)
            }
        }
    }
}