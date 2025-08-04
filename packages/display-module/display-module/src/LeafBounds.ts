import { ILeafBoundsModule, IBoundsData } from '@leafer/interface'
import { BoundsHelper } from '@leafer/math'
import { PathBounds } from '@leafer/path'
import { BranchHelper, LeafHelper } from '@leafer/helper'
import { BoundsEvent } from '@leafer/event'


const { updateMatrix, updateAllMatrix } = LeafHelper
const { updateBounds } = BranchHelper
const { toOuterOf, copyAndSpread, copy } = BoundsHelper
const { toBounds } = PathBounds

export const LeafBounds: ILeafBoundsModule = {

    __updateWorldBounds(): void {

        const layout = this.__layout

        toOuterOf(layout.renderBounds, this.__world, this.__world)

        if (layout.resized) {
            if (layout.resized === 'inner') this.__onUpdateSize() // scale变化不用更新
            if (this.__hasLocalEvent) BoundsEvent.emitLocal(this)
            layout.resized = undefined
        }

        if (this.__hasWorldEvent) BoundsEvent.emitWorld(this)

    },

    __updateLocalBounds(): void {

        const layout = this.__layout

        if (layout.boxChanged) {

            if (!this.__.__pathInputed) this.__updatePath()
            this.__updateRenderPath()

            this.__updateBoxBounds()
            layout.resized = 'inner'
        }


        if (layout.localBoxChanged) { // position change

            if (this.__local) this.__updateLocalBoxBounds()
            layout.localBoxChanged = undefined

            if (layout.strokeSpread) layout.strokeChanged = true
            if (layout.renderSpread) layout.renderChanged = true
            if (this.parent) this.parent.__layout.boxChange()
        }


        layout.boxChanged = undefined // must after updateLocalBoxBounds()


        if (layout.strokeChanged) {

            layout.strokeSpread = this.__updateStrokeSpread()

            if (layout.strokeSpread) {

                if (layout.strokeBounds === layout.boxBounds) layout.spreadStroke()

                this.__updateStrokeBounds()
                this.__updateLocalStrokeBounds()

            } else {
                layout.spreadStrokeCancel()
            }

            layout.strokeChanged = undefined
            if (layout.renderSpread || layout.strokeSpread !== layout.strokeBoxSpread) layout.renderChanged = true

            if (this.parent) this.parent.__layout.strokeChange()
            layout.resized = 'inner'
        }


        if (layout.renderChanged) {

            layout.renderSpread = this.__updateRenderSpread()

            if (layout.renderSpread) {

                if (layout.renderBounds === layout.boxBounds || layout.renderBounds === layout.strokeBounds) layout.spreadRender()

                this.__updateRenderBounds()
                this.__updateLocalRenderBounds()

            } else {
                layout.spreadRenderCancel()
            }

            layout.renderChanged = undefined

            if (this.parent) this.parent.__layout.renderChange()
        }

        layout.resized || (layout.resized = 'local')
        layout.boundsChanged = undefined

    },

    __updateLocalBoxBounds(): void {
        if (this.__hasMotionPath) this.__updateMotionPath()
        if (this.__hasAutoLayout) this.__updateAutoLayout() //  origin / around / flow
        toOuterOf(this.__layout.boxBounds, this.__local, this.__local)
    },

    __updateLocalStrokeBounds(): void {
        toOuterOf(this.__layout.strokeBounds, this.__localMatrix, this.__layout.localStrokeBounds)
    },

    __updateLocalRenderBounds(): void {
        toOuterOf(this.__layout.renderBounds, this.__localMatrix, this.__layout.localRenderBounds)
    },


    __updateBoxBounds(_secondLayout?: boolean, _bounds?: IBoundsData): void {
        const b = this.__layout.boxBounds
        const data = this.__
        if (data.__pathInputed) {
            toBounds(data.path, b)
        } else {
            b.x = 0
            b.y = 0
            b.width = data.width
            b.height = data.height
        }
    },


    __updateAutoLayout(): void {
        this.__layout.matrixChanged = true
        if (this.isBranch) {

            this.__extraUpdate()

            if (this.__.flow) {

                if (this.__layout.boxChanged) this.__updateFlowLayout()

                updateAllMatrix(this)
                updateBounds(this, this)

                if (this.__.__autoSide) this.__updateBoxBounds(true)

            } else {

                updateAllMatrix(this)
                updateBounds(this, this)

            }

        } else {
            updateMatrix(this)
        }
    },

    __updateNaturalSize(): void {
        const { __: data, __layout: layout } = this
        data.__naturalWidth = layout.boxBounds.width
        data.__naturalHeight = layout.boxBounds.height
    },

    __updateStrokeBounds(_bounds?: IBoundsData): void {
        const layout = this.__layout
        copyAndSpread(layout.strokeBounds, layout.boxBounds, layout.strokeBoxSpread)
    },

    __updateRenderBounds(_bounds?: IBoundsData): void {
        const layout = this.__layout
        layout.renderSpread > 0 ? copyAndSpread(layout.renderBounds, layout.boxBounds, layout.renderSpread) : copy(layout.renderBounds, layout.strokeBounds) // Box use -1
    }

}