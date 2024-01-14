import { IInteractionConfig } from '@leafer/interface'
import { Platform } from '@leafer/platform'


export const config: IInteractionConfig = {
    wheel: {
        zoomMode: false,
        zoomSpeed: 0.5,
        moveSpeed: 0.5,
        rotateSpeed: 0.5,
        delta: Platform.os === 'Windows' ? { x: 150 / 4, y: 150 / 4 } : { x: 80 / 4, y: 8.0 },
        preventDefault: true
    },
    pointer: {
        hitRadius: 5,
        through: false,
        tapTime: 120,
        longPressTime: 800,
        transformTime: 500,
        dragHover: true,
        dragDistance: 2,
        swipeDistance: 20,
        ignoreMove: false,
        preventDefaultMenu: true
    },
    cursor: {}
}