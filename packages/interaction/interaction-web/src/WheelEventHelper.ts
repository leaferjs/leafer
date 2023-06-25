import { IPointData, IWheelConfig } from '@leafer/interface'
import { MathHelper } from '@leafer/math'
import { Platform } from '@leafer/platform'


export const WheelEventHelper = {

    getMove(e: WheelEvent, config: IWheelConfig): IPointData {
        return { x: -e.deltaX * config.moveSpeed * 2, y: -e.deltaY * config.moveSpeed * 2 }
    },

    getScale(e: WheelEvent, config: IWheelConfig): number {

        let zoom: boolean
        let scale = 1
        let { zoomMode, zoomSpeed } = config

        const y = e.deltaY || e.deltaX

        if (zoomMode) {

            const intWheelDeltaY = Platform.intWheelDeltaY && Math.abs(e.deltaY) > 17 // firfox鼠标滚动为整数，为18或19的倍数

            // 触摸板滚动手势的deltaY是整数, 鼠标滚动/触摸板缩放的deltaY有小数点
            zoom = (Math.floor(e.deltaY) !== e.deltaY || intWheelDeltaY) && e.deltaX === 0
            if (e.shiftKey || e.metaKey || e.ctrlKey) zoom = true

        } else {
            zoom = !e.shiftKey && (e.metaKey || e.ctrlKey)
        }

        if (zoom) {
            zoomSpeed = MathHelper.within(zoomSpeed, 0, 1)
            const min = e.deltaY ? config.delta.y : config.delta.x
            scale = 1 - y / (min * 25 * (1 - zoomSpeed) + 10) // zoomSpeed
            if (scale < 0.5) scale = 0.5
            if (scale >= 1.5) scale = 1.5
        }

        return scale
    }

}