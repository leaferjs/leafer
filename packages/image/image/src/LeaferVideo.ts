import { ILeaferVideo } from '@leafer/interface'

import { LeaferImage } from './LeaferImage'


export class LeaferVideo extends LeaferImage implements ILeaferVideo {

    public get tag() { return 'Video' }

}