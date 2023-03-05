import { IUIEvent } from '@leafer/interface'


export class PointerButton {

    static left(event: IUIEvent): boolean { return event.buttons === 1 }

    static right(event: IUIEvent): boolean { return event.buttons === 2 }

    static middle(event: IUIEvent): boolean { return event.buttons === 4 }

}