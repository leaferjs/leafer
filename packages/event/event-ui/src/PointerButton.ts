import { IUIEvent } from '@leafer/interface'


export const PointerButton = {

    left(event: IUIEvent): boolean { return event.buttons === 1 },

    right(event: IUIEvent): boolean { return event.buttons === 2 },

    middle(event: IUIEvent): boolean { return event.buttons === 4 }

}