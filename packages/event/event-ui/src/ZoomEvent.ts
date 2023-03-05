import { UIEvent } from './UIEvent'
import { IZoomEvent } from '@leafer/interface'
import { registerEvent } from '@leafer/decorator'


@registerEvent()
export class ZoomEvent extends UIEvent implements IZoomEvent {

    static ZOOM = 'zoom'

    static START = 'zoom.start'
    static END = 'zoom.end'

    readonly scale: number

}