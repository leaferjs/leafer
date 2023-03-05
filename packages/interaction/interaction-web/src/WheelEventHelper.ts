import { IPointData, IWheelConfig, IObject } from '@leafer/interface'
import { MathHelper } from '@leafer/math'


let countFirefoxWheel: number = 0

export const WheelEventHelper = {

    getMove(e: WheelEvent, config: IWheelConfig): IPointData {
        return { x: -e.deltaX * config.moveSpeed * 2, y: -e.deltaY * config.moveSpeed * 2 }
    },

    getScale(e: WheelEvent, config: IWheelConfig): number {

        let zoom: boolean
        let scale = 1
        let { zoomMode, zoomSpeed } = config

        const y = e.deltaY || e.deltaX
        //console.log(e.deltaX, e.deltaY)

        if (zoomMode) {

            const firefoxWheel = (e as IObject).mozInputSource && e.deltaY % 18 === 0 // firfox鼠标竖向滚动为18的倍数
            firefoxWheel ? countFirefoxWheel++ : countFirefoxWheel = 0

            // 触摸板滚动手势的deltaY是整数, 鼠标滚动/触摸板缩放的deltaY有小数点
            zoom = (Math.floor(e.deltaY) !== e.deltaY || (firefoxWheel && countFirefoxWheel > 2)) && e.deltaX === 0
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