import { IUIEvent, IPointerEvent, ILeaf, IInteraction, IInteractionConfig, ILeafList, ILeaferCanvas, IMoveEvent, IZoomEvent, IRotateEvent, ISelector, IBounds, IEventListenerId } from '@leafer/interface'
import { PointerEvent, DropEvent, PointerButton } from '@leafer/event-ui'
import { ResizeEvent } from '@leafer/event'
import { LeafList } from '@leafer/list'
import { Bounds, PointHelper } from '@leafer/math'
import { DataHelper } from '@leafer/data'

import { Transformer } from './Transformer'
import { Dragger } from './Dragger'
import { emit } from './emit'
import { InteractionHelper } from './InteractionHelper'


const { pathHasEventType } = InteractionHelper

export class InteractionBase implements IInteraction {

    public target: ILeaf
    public canvas: ILeaferCanvas
    public selector: ISelector

    public running: boolean
    public get dragging(): boolean { return this.dragger.dragging }

    public config: IInteractionConfig = {
        wheel: {
            zoomMode: false,
            zoomSpeed: 0.5,
            moveSpeed: 0.5,
            rotateSpeed: 0.5,
            delta: { x: 80 / 4, y: 8.0 }
        },
        pointer: {
            hitRadius: 5,
            through: false,
            clickTime: 120,
            longPressTime: 800,
            transformTime: 500,
            dragDistance: 2,
            swipeDistance: 20,
            autoMoveDistance: 2,
            ignoreMove: false
        }
    }

    public get hitRadius(): number { return this.config.pointer.hitRadius }

    public shrinkCanvasBounds: IBounds

    public downData: IPointerEvent

    protected downTime: number
    protected enterPath: LeafList

    protected waitTap: boolean
    protected longPressTimer: number
    protected longPressed: boolean
    protected clickCount = 0
    protected clickTimer: number

    protected dragger: Dragger
    protected transformer: Transformer

    protected __eventIds: IEventListenerId[]

    constructor(target: ILeaf, canvas: ILeaferCanvas, selector: ISelector, userConfig?: IInteractionConfig) {
        this.target = target
        this.canvas = canvas
        this.selector = selector

        this.transformer = new Transformer(this)
        this.dragger = new Dragger(this)

        if (userConfig) this.config = DataHelper.default(userConfig, this.config)
        this.__listenEvents()
    }


    public start(): void {
        this.running = true
    }

    public stop(): void {
        this.running = false
    }


    public pointerDown(data: IPointerEvent): void {
        this.emit(PointerEvent.BEFORE_DOWN, data, this.selector.defaultPath)

        const { hitRadius, through } = this.config.pointer
        const find = this.selector.getHitPointPath(data, hitRadius, { through })
        if (find.throughPath) data.throughPath = find.throughPath
        data.path = find.path
        this.emit(PointerEvent.DOWN, data)

        this.downData = data
        this.downTime = Date.now()

        this.dragger.setDragData(data)

        if (PointerButton.left(data)) {
            this.tapWait()
            this.longPressWait(data)
        }
    }

    public pointerMove(data: IPointerEvent): void {
        if (!this.downData && !this.canvas.bounds.hitPoint(data)) return
        this.pointerMoveReal(data)
        this.dragger.checkDragOut(data)
    }

    public pointerMoveReal(data: IPointerEvent): void {
        this.emit(PointerEvent.BEFORE_MOVE, data, this.selector.defaultPath)

        if (this.downData) {
            const canDrag = PointHelper.getDistance(this.downData, data) > this.config.pointer.dragDistance
            if (this.waitTap && canDrag) this.pointerWaitCancel()

            this.dragger.checkDrag(data, canDrag)
        }

        if (this.dragger.moving || this.config.pointer.ignoreMove) return

        const find = this.selector.getHitPointPath(data, this.hitRadius, { exclude: this.dragger.getDragList() })
        data.path = find.path
        this.emit(PointerEvent.MOVE, data)

        this.pointerEnterOrLeave(data)
        if (this.dragger.dragging) this.dragger.dropEnterOrLeave(data)
    }

    public pointerUp(data: IPointerEvent): void {
        if (!this.downData) return

        this.emit(PointerEvent.BEFORE_UP, data, this.selector.defaultPath)

        const { through } = this.config.pointer
        const find = this.selector.getHitPointPath(data, this.hitRadius, { through })
        if (find.throughPath) data.throughPath = find.throughPath
        data.path = find.path

        this.emit(PointerEvent.UP, data)
        this.emit(PointerEvent.UP, this.downData, undefined, data.path) // downPath必须触发up

        this.touchLeave(data)

        this.tap(data)
        this.longTap(data)

        this.dragger.dragEnd(data)

        this.downData = null
    }

    public pointerCancel(): void {
        this.pointerUp(this.dragger.dragData)
    }


    // window transform
    public move(data: IMoveEvent): void {
        this.transformer.move(data)
    }

    public zoom(data: IZoomEvent): void {
        this.transformer.zoom(data)
    }

    public rotate(data: IRotateEvent): void {
        this.transformer.rotate(data)
    }

    public transformEnd(): void {
        this.transformer.transformEnd()
    }


    // helper
    protected pointerEnterOrLeave(data: IPointerEvent): void {
        if (this.dragger.moving || this.dragger.dragging) return
        const { path } = data
        this.emit(PointerEvent.ENTER, data, path, this.enterPath)
        this.emit(PointerEvent.LEAVE, data, this.enterPath, path)
        this.enterPath = path
    }

    protected touchLeave(data: IPointerEvent): void {
        if (data.pointerType === 'touch') {
            if (this.enterPath) {
                this.emit(PointerEvent.LEAVE, data)
                if (this.dragger.dragging) this.emit(DropEvent.LEAVE, data)
            }
        }
    }

    protected tap(data: IPointerEvent): void {
        if (!this.waitTap) return
        if (!this.clickCount) this.emit(PointerEvent.TAP, data)

        const useTime = Date.now() - this.downTime

        if (useTime < this.config.pointer.clickTime + 50 && pathHasEventType(data.path, PointerEvent.DOUBLE_CLICK)) {

            this.clickCount++
            if (this.clickCount === 2) {
                this.tapWaitCancel()
                this.emit(PointerEvent.DOUBLE_CLICK, data)
            } else {
                clearTimeout(this.clickTimer)
                this.clickTimer = window.setTimeout(() => {
                    this.tapWaitCancel()
                    this.emit(PointerEvent.CLICK, data)
                }, this.config.pointer.clickTime)
            }

        } else {
            this.tapWaitCancel()
            this.emit(PointerEvent.CLICK, data)
        }
    }

    public pointerWaitCancel(): void {
        this.tapWaitCancel()
        this.longPressWaitCancel()
    }

    protected tapWait(): void {
        clearTimeout(this.clickTimer)
        this.waitTap = true
    }

    protected tapWaitCancel(): void {
        clearTimeout(this.clickTimer)
        this.waitTap = false
        this.clickCount = 0
    }

    protected longPressWait(data: IPointerEvent): void {
        clearTimeout(this.longPressTimer)
        this.longPressTimer = window.setTimeout(() => {
            this.longPressed = true
            this.emit(PointerEvent.LONG_PRESS, data)
        }, this.config.pointer.longPressTime)
    }

    protected longTap(data: IPointerEvent): void {
        if (this.longPressed) this.emit(PointerEvent.LONG_TAP, data)
        this.longPressWaitCancel()
    }

    protected longPressWaitCancel(): void {
        clearTimeout(this.longPressTimer)
        this.longPressed = false
    }

    protected __onResize(): void {
        this.shrinkCanvasBounds = new Bounds(this.canvas.bounds)
        this.shrinkCanvasBounds.spread(-2)
    }

    protected __listenEvents(): void {
        const { target } = this
        this.__eventIds = [target.on__(ResizeEvent.RESIZE, this.__onResize, this)]
    }

    protected __removeListenEvents(): void {
        this.target.off__(this.__eventIds)
    }


    public emit(type: string, data: IUIEvent, path?: ILeafList, excludePath?: ILeafList): void {
        if (this.running) emit(type, data, path, excludePath)
    }


    public destroy(): void {
        if (this.target) {
            this.running = false

            this.__removeListenEvents()
            this.dragger.destroy()
            this.transformer.destroy()

            this.config = null
            this.target = null
            this.selector = null
            this.canvas = null

            this.dragger = null
            this.transformer = null
        }
    }

}