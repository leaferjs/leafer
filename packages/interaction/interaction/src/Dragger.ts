import { IPointerEvent, IDragEvent, ILeaf, ILeafList } from '@leafer/interface'
import { MoveEvent, DragEvent, DropEvent, PointerButton, Keyboard } from '@leafer/event-ui'
import { BoundsHelper, PointHelper } from '@leafer/math'
import { LeafHelper } from '@leafer/helper'

import { InteractionHelper } from './InteractionHelper'
import { InteractionBase } from './Interaction'


const { getDragEventData, getDropEventData, getSwipeEventData, filterPathByEventType } = InteractionHelper

export class Dragger {

    protected interaction: InteractionBase

    public moving: boolean
    public dragging: boolean

    public dragData: IDragEvent

    protected dragList: ILeafList
    protected dragableList: ILeaf[]
    protected dropEnterPath: ILeafList

    protected autoMoveTimer: number

    constructor(interaction: InteractionBase) {
        this.interaction = interaction
    }

    public setDragData(data: IPointerEvent): void {
        this.dragData = getDragEventData(data, data, data)
    }

    public getDragList(): ILeafList {
        return this.dragging ? DropEvent.dragList || this.dragList : null
    }

    public checkDrag(data: IPointerEvent, canDrag: boolean): void {
        const { interaction } = this
        const { downData } = interaction

        if (this.moving && !(PointerButton.middle(data) || PointerButton.left(data))) {
            interaction.pointerCancel() // 按住中键拖出页面后的up事件接收不到
            return
        }

        const { dragData } = this

        if (!this.moving) {
            this.moving = (PointerButton.middle(data) || Keyboard.isHoldSpaceKey()) && canDrag
            if (this.moving) interaction.emit(MoveEvent.START, dragData)
        }

        if (!this.moving) {
            this.dragStart(data, canDrag)
        }

        const { path, throughPath } = downData
        this.dragData = getDragEventData(downData, dragData, data)
        if (throughPath) this.dragData.throughPath = throughPath
        this.dragData.path = path

        if (this.moving) {
            interaction.emit(MoveEvent.MOVE, this.dragData)
        } else if (this.dragging) {
            interaction.emit(DragEvent.DRAG, this.dragData)
            this.dragDragableList()
        }

    }

    public dragStart(data: IPointerEvent, canDrag: boolean): void {
        if (!this.dragging) {
            this.dragging = PointerButton.left(data) && canDrag
            if (this.dragging) {
                this.interaction.emit(DragEvent.START, this.dragData)
                this.dragList = filterPathByEventType(this.dragData.path, DragEvent.DRAG)
                this.getDragableList(this.dragData.path)
            }
        }
    }

    protected getDragableList(path: ILeafList): void {
        let leaf: ILeaf
        for (let i = 0, len = path.length; i < len; i++) {
            leaf = path.list[i]
            if (leaf.draggable) {
                this.dragableList = [leaf]
                break
            }
        }
    }

    protected dragDragableList(): void {
        if (this.dragableList) {
            const { moveX, moveY } = this.dragData
            this.dragableList.forEach(leaf => {
                LeafHelper.moveOfWorld(leaf, moveX, moveY)
            })
        }
    }

    public dropEnterOrLeave(data: IPointerEvent): void {
        const { interaction } = this
        const { dropEnterPath } = this
        const { path } = data

        interaction.emit(DropEvent.ENTER, data, path, dropEnterPath)
        interaction.emit(DropEvent.LEAVE, data, dropEnterPath, path)
        this.dropEnterPath = path
    }

    public dragEnd(data: IPointerEvent): void {
        const { interaction } = this
        const { downData } = interaction

        if (!downData) return

        const { path, throughPath } = downData
        const endDragData = getDragEventData(downData, data, data)
        if (throughPath) endDragData.throughPath = throughPath
        endDragData.path = path

        if (this.moving) interaction.emit(MoveEvent.END, endDragData)
        if (this.dragging) {
            interaction.emit(DragEvent.END, endDragData)

            this.swipe(data, endDragData)
            this.drop(data)
        }

        this.autoMoveCancel()
        this.dragReset()
    }

    protected swipe(data: IPointerEvent, endDragData: IDragEvent): void {
        const { interaction } = this
        const { downData } = interaction
        if (PointHelper.getDistance(downData, data) > interaction.config.pointer.swipeDistance) {
            const swipeData = getSwipeEventData(downData, this.dragData, endDragData)
            this.interaction.emit(swipeData.type, swipeData)
        }
    }

    protected drop(data: IPointerEvent): void {
        const dropData = getDropEventData(this.getDragList(), data)
        dropData.path = this.dropEnterPath
        this.interaction.emit(DropEvent.DROP, dropData)
        this.interaction.emit(DropEvent.LEAVE, data, this.dropEnterPath)
    }

    protected dragReset(): void {
        DropEvent.dragList = null
        this.dragList = null
        this.dragableList = null
        this.dragData = null
        this.dropEnterPath = null
        this.dragging = null
        this.moving = null
    }


    public checkDragOut(data: IPointerEvent): void {
        const { interaction } = this
        this.autoMoveCancel()
        if (this.dragging && !interaction.shrinkCanvasBounds.hitPoint(data)) this.autoMoveOnDragOut(data)
    }


    protected autoMoveOnDragOut(data: IPointerEvent): void {
        const { interaction } = this
        const { downData } = interaction
        const { autoMoveDistance } = interaction.config.pointer
        if (!autoMoveDistance) return

        const bounds = interaction.shrinkCanvasBounds
        const { x, y } = bounds
        const right = BoundsHelper.right(bounds)
        const bottom = BoundsHelper.bottom(bounds)

        const moveX = data.x < x ? autoMoveDistance : (right < data.x ? -autoMoveDistance : 0)
        const moveY = data.y < y ? autoMoveDistance : (bottom < data.y ? -autoMoveDistance : 0)
        let totalX = 0, totalY = 0

        this.autoMoveTimer = setInterval(() => {
            totalX += moveX
            totalY += moveY

            BoundsHelper.move(downData, moveX, moveY)
            BoundsHelper.move(this.dragData, moveX, moveY)

            interaction.move({ ...data, moveX, moveY, totalX, totalY })
            interaction.pointerMoveReal(data)
        }, 10)
    }

    protected autoMoveCancel(): void {
        if (this.autoMoveTimer) {
            clearInterval(this.autoMoveTimer)
            this.autoMoveTimer = 0
        }
    }

    public destroy(): void {
        this.interaction = null
        this.dragableList = null
    }
}