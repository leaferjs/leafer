import { ILeaf, ILeaferCanvas, IRenderOptions, IBranchRenderModule } from '@leafer/interface'


export const BranchRender: IBranchRenderModule = {

    __render(canvas: ILeaferCanvas, options: IRenderOptions): void {
        if (this.__worldOpacity) {

            if (this.__.__single) {
                canvas.resetTransform()
                const tempCanvas = canvas.getSameCanvas()

                this.__renderBranch(tempCanvas, options)

                canvas.copyWorld(tempCanvas, this.__world, this.__world, this.__.blendMode)
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
            let maskCanvas = canvas.getSameCanvas()
            let contentCanvas = canvas.getSameCanvas()

            for (let i = 0, len = children.length; i < len; i++) {
                child = children[i]

                if (child.isMask) {
                    if (mask) {
                        this.__renderMask(canvas, contentCanvas, maskCanvas)
                        maskCanvas.clear()
                        contentCanvas.clear()
                    } else {
                        mask = true
                    }

                    child.__render(maskCanvas, options)
                    continue
                }

                child.__render(contentCanvas, options)
            }

            this.__renderMask(canvas, contentCanvas, maskCanvas)
            maskCanvas.recycle()
            contentCanvas.recycle()

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