import { IObject, IPointData, IBounds } from '@leafer/interface'
import { InteractionBase, InteractionHelper } from '@leafer/interaction'
import { Bounds, MathHelper } from '@leafer/math'
import { Keyboard } from '@leafer/event-ui'

import { PointerEventHelper } from './PointerEventHelper'
import { MutiTouchHelper } from './MutiTouchHelper'
import { WheelEventHelper } from './WheelEventHelper'


interface IClientPoint {
    clientX: number
    clientY: number
}

interface IGestureEvent extends IClientPoint {
    scale: number
    rotation: number
    preventDefault(): void
}


const { getMoveEventData, getZoomEventData, getRotateEventData } = InteractionHelper

export class Interaction extends InteractionBase {

    protected view: HTMLElement
    protected clientBounds: IBounds

    protected viewEvents: IObject
    protected windowEvents: IObject


    protected usePointer: boolean
    protected useMutiTouch: boolean
    protected useTouch: boolean

    protected touchTimer: number
    protected touches?: Touch[]
    protected lastGestureScale: number
    protected lastGestureRotation: number

    protected listenEvents(): void {
        super.listenEvents()

        const view = this.view = this.canvas.view as HTMLCanvasElement

        this.onResize()

        // 优先使用PointerEvent > 再降级使用TouchEvent > MouseEvent
        this.viewEvents = {
            'pointerdown': this.onPointerDown.bind(this),
            'mousedown': this.onMouseDown.bind(this),
            'touchstart': this.onTouchStart.bind(this),

            'wheel': this.onWheel.bind(this),
            'gesturestart': this.onGesturestart.bind(this),
            'gesturechange': this.onGesturechange.bind(this),
            'gestureend': this.onGestureend.bind(this)
        }

        this.windowEvents = {
            'pointermove': this.onPointerMove.bind(this),
            'pointerup': this.onPointerUp.bind(this),
            'pointercancel': this.onPointerCancel.bind(this),

            'mousemove': this.onMouseMove.bind(this),
            'mouseup': this.onMouseUp.bind(this),

            // touch / multitouch
            'touchmove': this.onTouchMove.bind(this),
            'touchend': this.onTouchEnd.bind(this),
            'touchcancel': this.onTouchCancel.bind(this),

            'keydown': this.onKeyDown.bind(this),
            'keyup': this.onKeyUp.bind(this)
        }


        for (let name in this.viewEvents) {
            view.addEventListener(name, this.viewEvents[name])
        }

        for (let name in this.windowEvents) {
            window.addEventListener(name, this.windowEvents[name])
        }

        window.oncontextmenu = function () { return false }
    }

    protected removeListenEvents(): void {
        super.removeListenEvents()

        for (let name in this.viewEvents) {
            this.view.removeEventListener(name, this.viewEvents[name])
            this.viewEvents = {}
        }

        for (let name in this.windowEvents) {
            window.removeEventListener(name, this.windowEvents[name])
            this.windowEvents = {}
        }
    }

    protected onResize(): void {
        super.onResize()
        this.clientBounds = new Bounds(this.view.getBoundingClientRect())
    }

    protected getLocal(p: IClientPoint): IPointData {
        return { x: p.clientX - this.clientBounds.x, y: p.clientY - this.clientBounds.y }
    }


    // key
    protected onKeyDown(e: KeyboardEvent): void {
        Keyboard.setDownCode(e.code)
    }

    protected onKeyUp(e: KeyboardEvent): void {
        Keyboard.setUpCode(e.code)
    }


    // pointer
    protected onPointerDown(e: PointerEvent): void {
        if (!this.usePointer) this.usePointer = true
        if (this.useMutiTouch) return
        e.preventDefault()
        this.pointerDown(PointerEventHelper.convert(e, this.getLocal(e)))
    }

    protected onPointerMove(e: PointerEvent): void {
        if (!this.usePointer) this.usePointer = true
        if (this.useMutiTouch) return
        this.pointerMove(PointerEventHelper.convert(e, this.getLocal(e)))
    }

    protected onPointerUp(e: PointerEvent): void {
        if (this.useMutiTouch) return
        e.preventDefault()
        this.pointerUp(PointerEventHelper.convert(e, this.getLocal(e)))
    }

    protected onPointerCancel(): void {
        if (this.useMutiTouch) return
        this.pointerCancel()
    }


    // mouse
    protected onMouseDown(e: MouseEvent): void {
        if (this.useTouch || this.usePointer) return
        e.preventDefault()
        this.pointerDown(PointerEventHelper.convertMouse(e, this.getLocal(e)))
    }

    protected onMouseMove(e: MouseEvent): void {
        if (this.useTouch || this.usePointer) return
        this.pointerMove(PointerEventHelper.convertMouse(e, this.getLocal(e)))
    }

    protected onMouseUp(e: MouseEvent): void {
        if (this.useTouch || this.usePointer) return
        e.preventDefault()
        this.pointerUp(PointerEventHelper.convertMouse(e, this.getLocal(e)))
    }

    protected onMouseCancel(): void {
        if (this.useTouch || this.usePointer) return
        this.pointerCancel()
    }


    // touch
    protected onTouchStart(e: TouchEvent): void {
        e.preventDefault()

        this.mutiTouchStart(e)

        if (this.usePointer) return
        if (this.touchTimer) {
            window.clearTimeout(this.touchTimer)
            this.touchTimer = 0
        }
        this.useTouch = true
        const touch = PointerEventHelper.getTouch(e)
        this.pointerDown(PointerEventHelper.convertTouch(e, this.getLocal(touch)))
    }

    protected onTouchMove(e: TouchEvent): void {
        this.mutiTouchMove(e)

        if (this.usePointer) return
        const touch = PointerEventHelper.getTouch(e)
        this.pointerMove(PointerEventHelper.convertTouch(e, this.getLocal(touch)))
    }

    protected onTouchEnd(e: TouchEvent): void {
        e.preventDefault()
        this.mutiTouchEnd()

        if (this.usePointer) return
        if (this.touchTimer) clearTimeout(this.touchTimer)
        this.touchTimer = window.setTimeout(() => {
            this.useTouch = false
        }, 500) // stop touch > mouse
        const touch = PointerEventHelper.getTouch(e)
        this.pointerUp(PointerEventHelper.convertTouch(e, this.getLocal(touch)))
    }

    protected onTouchCancel(): void {
        if (this.usePointer) return
        this.pointerCancel()
    }


    // mutiTouch
    protected mutiTouchStart(e: TouchEvent): void {
        this.useMutiTouch = (e.touches.length >= 2)
        this.touches = this.useMutiTouch ? MutiTouchHelper.getTouches(e.touches) : undefined
        if (this.useMutiTouch) this.pointerCancel()
    }

    protected mutiTouchMove(e: TouchEvent): void {
        if (!this.useMutiTouch) return
        if (e.touches.length >= 2) {
            const touches = MutiTouchHelper.getTouches(e.touches)
            const touch0 = touches.find(touch => touch.identifier === this.touches[0].identifier)
            const touch1 = touches.find(touch => touch.identifier === this.touches[1].identifier)

            if (touch0 && touch1) {
                const from = [this.getLocal(this.touches[0]), this.getLocal(this.touches[1])]
                const to = [this.getLocal(touch0), this.getLocal(touch1)]
                const { move, angle, scale, center } = MutiTouchHelper.getData(from, to)

                const eventBase = InteractionHelper.getBase(e)

                this.rotate(getRotateEventData(center, angle, eventBase))
                this.zoom(getZoomEventData(center, scale, eventBase))
                this.move(getMoveEventData(center, move, eventBase))

                this.touches = touches
            }
        }
    }

    protected mutiTouchEnd(): void {
        this.touches = undefined
        this.useMutiTouch = false
        this.transformEnd()
    }


    // wheel
    protected onWheel(e: WheelEvent): void {
        e.preventDefault()

        const { wheel } = this.config
        const scale = wheel.getScale ? wheel.getScale(e, wheel) : WheelEventHelper.getScale(e, wheel)

        const local = this.getLocal(e)
        const eventBase = InteractionHelper.getBase(e)

        scale !== 1 ? this.zoom(getZoomEventData(local, scale, eventBase)) : this.move(getMoveEventData(local, wheel.getMove ? wheel.getMove(e, wheel) : WheelEventHelper.getMove(e, wheel), eventBase))
    }


    // safari 
    protected onGesturestart(e: IGestureEvent): void {
        e.preventDefault()
        this.lastGestureScale = 1
        this.lastGestureRotation = 0
    }

    protected onGesturechange(e: IGestureEvent): void {
        e.preventDefault()

        const local = this.getLocal(e)
        const eventBase = InteractionHelper.getBase(e)
        const changeScale = e.scale / this.lastGestureScale
        const changeAngle = e.rotation - this.lastGestureRotation

        let { rotateSpeed } = this.config.wheel
        rotateSpeed = MathHelper.within(rotateSpeed, 0, 1)

        this.zoom(getZoomEventData(local, changeScale * changeScale, eventBase))
        this.rotate(getRotateEventData(local, changeAngle / Math.PI * 180 * (rotateSpeed / 4 + 0.1), eventBase))

        this.lastGestureScale = e.scale
        this.lastGestureRotation = e.rotation
    }

    protected onGestureend(e: IGestureEvent): void {
        e.preventDefault()
        this.transformEnd()
    }

    public destroy(): void {
        if (this.view) {
            super.destroy()
            this.view = undefined
            this.touches = undefined
        }
    }

}