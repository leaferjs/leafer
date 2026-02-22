import { ILeaferFilm } from '@leafer/interface'

import { LeaferImage } from './LeaferImage'


export class LeaferFilm extends LeaferImage implements ILeaferFilm {

    public get tag() { return 'Film' }

}