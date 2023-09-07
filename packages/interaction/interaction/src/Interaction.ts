import { IUIEvent, IPointerEvent, ILeaf, IInteraction, IInteractionConfig, ILeafList, IMoveEvent, IZoomEvent, IRotateEvent, ISelector, IBounds, IEventListenerId, IInteractionCanvas, ITimer, IKeepTouchData, IKeyEvent } from '@leafer/interface'
import { PointerEvent, DropEvent, KeyEvent, PointerButton, Keyboard } from '@leafer/event-ui'
import { LeaferEvent, ResizeEvent } from '@leafer/event'
import { LeafList } from '@leafer/list'
import { Bounds, PointHelper } from '@leafer/math'
import { DataHelper } from '@leafer/data'

import { Transformer } from './Transformer'
import { Dragger } from './Dragger'
import { emit } from './emit'
import { InteractionHelper } from './InteractionHelper'
import { Platform } from '@leafer/platform'
import { MultiTouchHelper } from './MultiTouchHelper'


const { pathHasEventType, getMoveEventData, getZoomEventData, getRotateEventData } = InteractionHelper

export class InteractionBase implements IInteraction {

    public target: ILeaf
    public canvas: IInteractionCanvas
    public selector: ISelector

    public running: boolean
    public get dragging(): boolean { return this.dragger.dragging }

    public config: IInteractionConfig = {
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
            ignoreMove: false
        }
    }

    public get hitRadius(): number { return this.config.pointer.hitRadius }

    public shrinkCanvasBounds: IBounds

    public downData: IPointerEvent
    public hoverData: IPointerEvent

    public downTime: number
    protected overPath: LeafList
    protected enterPath: LeafList

    protected waitTap: boolean
    protected longPressTimer: ITimer
    protected longPressed: boolean
    protected tapCount = 0
    protected tapTimer: ITimer

    protected dragger: Dragger
    protected transformer: Transformer

    protected __eventIds: IEventListenerId[]
    protected defaultPath: ILeafList

    constructor(target: ILeaf, canvas: IInteractionCanvas, selector: ISelector, userConfig?: IInteractionConfig) {
        this.target = target
        this.canvas = canvas
        this.selector = selector
        this.defaultPath = new LeafList(target)

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


    public receive(_event: any): void { }


    public pointerDown(data: IPointerEvent, defaultPath?: boolean): void {
        this.emit(PointerEvent.BEFORE_DOWN, data, this.defaultPath)

        const { hitRadius, through } = this.config.pointer
        const find = this.selector.getByPoint(data, hitRadius, { through })
        if (find.throughPath) data.throughPath = find.throughPath
        data.path = defaultPath ? this.defaultPath : find.path
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
        const hit = this.canvas.bounds.hitPoint(data)
        if (hit || this.downData) {
            if (hit && !this.downData && PointerButton.left(data)) this.pointerDown(data, true) // 从外部拖拽内容进入，需要先模拟down事件
            this.pointerMoveReal(data)
            this.dragger.checkDragOut(data)
        }
    }

    public pointerMoveReal(data: IPointerEvent): void {
        this.emit(PointerEvent.BEFORE_MOVE, data, this.defaultPath)

        if (this.downData) {
            const canDrag = PointHelper.getDistance(this.downData, data) > this.config.pointer.dragDistance
            if (this.waitTap && canDrag) this.pointerWaitCancel()

            this.dragger.checkDrag(data, canDrag)
        }

        if (this.dragger.moving || this.config.pointer.ignoreMove) return

        this.updateHoverData(data)
        this.emit(PointerEvent.MOVE, data)

        this.pointerOverOrOut(data)
        this.pointerEnterOrLeave(data)
        if (this.dragger.dragging) {
            this.dragger.dragOverOrOut(data)
            this.dragger.dragEnterOrLeave(data)
        }

        this.updateCursor(data)
    }

    public pointerUp(data: IPointerEvent): void {
        if (!this.downData) return

        this.emit(PointerEvent.BEFORE_UP, data, this.defaultPath)

        const { through } = this.config.pointer
        const find = this.selector.getByPoint(data, this.hitRadius, { through })
        if (find.throughPath) data.throughPath = find.throughPath
        data.path = find.path

        this.emit(PointerEvent.UP, data)
        this.emit(PointerEvent.UP, this.downData, undefined, data.path) // downPath必须触发up

        this.touchLeave(data)

        this.tap(data)

        this.dragger.dragEnd(data)

        this.downData = null
    }

    public pointerCancel(): void {
        this.pointerUp(this.dragger.dragData)
    }


    public multiTouch(data: IUIEvent, list: IKeepTouchData[]): void {
        const { move, angle, scale, center } = MultiTouchHelper.getData(list)
        this.rotate(getRotateEventData(center, angle, data))
        this.zoom(getZoomEventData(center, scale, data))
        this.move(getMoveEventData(center, move, data))
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


    // key

    public keyDown(data: IKeyEvent): void {
        if (!Keyboard.hasDownCode(data.code)) this.emit(KeyEvent.HOLD, data, this.defaultPath)
        this.emit(KeyEvent.DOWN, data, this.defaultPath)
    }

    public keyUp(data: IKeyEvent): void {
        this.emit(KeyEvent.UP, data, this.defaultPath)
    }

    public keyPress(data: IKeyEvent): void {
        this.emit(KeyEvent.PRESS, data, this.defaultPath)
    }


    // helper
    protected pointerOverOrOut(data: IPointerEvent): void {
        if (this.dragger.moving) return
        if (this.dragging && !this.config.pointer.dragHover) return

        const { path } = data
        if (this.overPath) {
            if (path.indexAt(0) !== this.overPath.indexAt(0)) {
                this.emit(PointerEvent.OUT, data, this.overPath)
                this.emit(PointerEvent.OVER, data, path)
            }
        } else {
            this.emit(PointerEvent.OVER, data, path)
        }
        this.overPath = path
    }

    protected pointerEnterOrLeave(data: IPointerEvent): void {
        if (this.dragger.moving) return
        if (this.dragging && !this.config.pointer.dragHover) return

        const { path } = data
        this.emit(PointerEvent.LEAVE, data, this.enterPath, path)
        this.emit(PointerEvent.ENTER, data, path, this.enterPath)
        this.enterPath = path
    }


    public updateHoverData(data: IPointerEvent): void {
        if (data) {
            const find = this.selector.getByPoint(data, this.hitRadius, { exclude: this.dragger.getDragList(), name: PointerEvent.MOVE })
            data.path = find.path
            this.hoverData = data
        }
    }

    public updateCursor(hoverData?: IPointerEvent): void {
        hoverData ? this.updateHoverData(this.hoverData) : hoverData = this.hoverData
        if (!hoverData || this.dragger.dragging) return
        const path = hoverData.path

        let leaf: ILeaf
        for (let i = 0, len = path.length; i < len; i++) {
            leaf = path.list[i]
            if (leaf.cursor && leaf.cursor !== 'default') {
                this.canvas.setCursor(leaf.cursor)
                return
            }
        }

        this.canvas.setCursor('default')
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
        const { pointer } = this.config

        const longTap = this.longTap(data)
        if (!pointer.tapMore && longTap) return

        if (!this.waitTap) return
        if (pointer.tapMore) this.emitTap(data)

        const useTime = Date.now() - this.downTime

        const hasDouble = [PointerEvent.DOUBLE_TAP, PointerEvent.DOUBLE_CLICK].some(type => pathHasEventType(data.path, type))

        if (useTime < pointer.tapTime + 50 && hasDouble) {

            this.tapCount++
            if (this.tapCount === 2) {
                this.tapWaitCancel()
                this.emitDoubleTap(data)
            } else {
                clearTimeout(this.tapTimer)
                this.tapTimer = setTimeout(() => {
                    if (!pointer.tapMore) {
                        this.tapWaitCancel()
                        this.emitTap(data)
                    }
                }, pointer.tapTime)
            }

        } else {

            if (!pointer.tapMore) {
                this.tapWaitCancel()
                this.emitTap(data)
            }
        }
    }

    protected emitTap(data: IPointerEvent) {
        this.emit(PointerEvent.TAP, data)
        this.emit(PointerEvent.CLICK, data)
    }

    protected emitDoubleTap(data: IPointerEvent) {
        this.emit(PointerEvent.DOUBLE_TAP, data)
        this.emit(PointerEvent.DOUBLE_CLICK, data)
    }

    public pointerWaitCancel(): void {
        this.tapWaitCancel()
        this.longPressWaitCancel()
    }

    protected tapWait(): void {
        clearTimeout(this.tapTimer)
        this.waitTap = true
    }

    protected tapWaitCancel(): void {
        clearTimeout(this.tapTimer)
        this.waitTap = false
        this.tapCount = 0
    }

    protected longPressWait(data: IPointerEvent): void {
        clearTimeout(this.longPressTimer)
        this.longPressTimer = setTimeout(() => {
            this.longPressed = true
            this.emit(PointerEvent.LONG_PRESS, data)
        }, this.config.pointer.longPressTime)
    }

    protected longTap(data: IPointerEvent): boolean {
        let longTap
        if (this.longPressed) {
            this.emit(PointerEvent.LONG_TAP, data)
            if (pathHasEventType(data.path, PointerEvent.LONG_TAP)) longTap = true
        }
        this.longPressWaitCancel()
        return longTap
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
        this.__eventIds = [target.on_(ResizeEvent.RESIZE, this.__onResize, this)]
        target.once(LeaferEvent.READY, () => this.__onResize())
    }

    protected __removeListenEvents(): void {
        this.target.off_(this.__eventIds)
        this.__eventIds.length = 0
    }


    public emit(type: string, data: IUIEvent, path?: ILeafList, excludePath?: ILeafList): void {
        if (this.running) emit(type, data, path, excludePath)
    }


    public destroy(): void {
        if (this.__eventIds.length) {
            this.stop()
            this.__removeListenEvents()
            this.dragger.destroy()
            this.transformer.destroy()
            this.downData = this.overPath = this.enterPath = null
        }
    }

}