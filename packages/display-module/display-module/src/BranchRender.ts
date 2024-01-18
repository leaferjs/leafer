import { ILeaf, ILeaferCanvas, IRenderOptions, IBranchRenderModule } from '@leafer/interface'


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

                canvas.opacity = this.__.opacity

                if (options.matrix) {
                    canvas.copyWorldByReset(tempCanvas, null, null, this.__.__blendMode, true)
                } else {
                    canvas.copyWorldByReset(tempCanvas, this.__world, this.__world, this.__.__blendMode, true)
                }

                tempCanvas.recycle()
            } else {
                this.__renderBranch(canvas, options)
            }

        }
    },

    __renderBranch(canvas: ILeaferCanvas, options: IRenderOptions): void {

        let child: ILeaf
        const { children } = this

        if (this.__hasMask && children.length > 1) {

            let mask: boolean
            const maskCanvas = canvas.getSameCanvas(false, true)
            const contentCanvas = canvas.getSameCanvas(false, true)

            for (let i = 0, len = children.length; i < len; i++) {
                child = children[i]

                if (child.isMask) {
                    if (mask) {
                        this.__renderMask(canvas, options, contentCanvas, maskCanvas)
                    } else {
                        mask = true
                    }

                    child.__render(maskCanvas, options)
                    continue
                }

                child.__render(mask ? contentCanvas : canvas, options)
            }

            this.__renderMask(canvas, options, contentCanvas, maskCanvas, true)

        } else {

            const { bounds, hideBounds } = options

            for (let i = 0, len = children.length; i < len; i++) {
                child = children[i]

                if (bounds && !bounds.hit(child.__world, options.matrix)) continue
                if (hideBounds && hideBounds.includes(child.__world, options.matrix)) continue

                child.__render(canvas, options)
            }

        }

    }

}