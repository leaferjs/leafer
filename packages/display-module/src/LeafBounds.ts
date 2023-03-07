import { ILeafBoundsModule } from '@leafer/interface'
import { BoundsHelper } from '@leafer/math'


const { setByBoundsTimesMatrix } = BoundsHelper

export const LeafBounds: ILeafBoundsModule = {

    __updateWorldBounds(): void {

        if (this.__layout.boundsChanged) {

            let resize: boolean
            const layout = this.__layout


            if (layout.boxBoundsChanged) {

                this.__updatePath()
                this.__updateRenderPath()

                this.__updateBoxBounds()
                layout.boxBoundsChanged = false
                resize = true
            }


            if (layout.localBoxBoundsChanged) { // position change

                this.__updateRelativeBoxBounds()
                layout.localBoxBoundsChanged = false

                if (layout.eventBoundsSpreadWidth) layout.eventBoundsChanged = true
                if (layout.renderBoundsSpreadWidth) layout.renderBoundsChanged = true
                this.parent?.__layout.boxBoundsChange()
            }


            if (layout.eventBoundsChanged) {

                layout.eventBoundsSpreadWidth = this.__updateEventBoundsSpreadWidth()

                if (layout.eventBoundsSpreadWidth) {

                    if (layout.eventBounds === layout.boxBounds) {
                        layout.eventBoundsSpread()
                    }

                    this.__updateEventBounds()
                    this.__updateRelativeEventBounds()
                    layout.eventBoundsChanged = false

                    if (layout.renderBoundsSpreadWidth) layout.renderBoundsChanged = true

                } else {
                    layout.eventBoundsSpreadCancel()
                }

                this.parent?.__layout.eventBoundsChange()
                resize || (resize = true)
            }


            if (layout.renderBoundsChanged) {

                layout.renderBoundsSpreadWidth = this.__updateRenderBoundsSpreadWidth()

                if (layout.renderBoundsSpreadWidth) {

                    if (layout.renderBounds === layout.boxBounds || layout.renderBounds === layout.eventBounds) {
                        layout.renderBoundsSpread()
                    }

                    this.__updateRenderBounds()
                    this.__updateRelativeRenderBounds()
                    layout.renderBoundsChanged = false

                } else {
                    layout.renderBoundsSpreadCancel()
                }

                this.parent?.__layout.renderBoundsChange()
            }


            layout.boundsChanged = false

            setByBoundsTimesMatrix(this.__world, this.__layout.renderBounds, this.__world)

            if (resize) this.__onUpdateSize()

        } else {
            setByBoundsTimesMatrix(this.__world, this.__layout.renderBounds, this.__world)
        }

    },

    __updateRelativeBoxBounds(): void {
        setByBoundsTimesMatrix(this.__relative, this.__layout.boxBounds, this.__relative)
    },

    __updateRelativeEventBounds(): void {
        setByBoundsTimesMatrix(this.__layout.relativeEventBounds, this.__layout.eventBounds, this.__relative)
    },

    __updateRelativeRenderBounds(): void {
        setByBoundsTimesMatrix(this.__layout.relativeRenderBounds, this.__layout.renderBounds, this.__relative)
    },


    __updateBoxBounds(): void {
        const b = this.__layout.boxBounds
        b.x = 0
        b.y = 0
        b.width = this.__.width
        b.height = this.__.height
    }

}