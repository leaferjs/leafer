export { PathHelper } from './PathHelper'
export { PathConvert } from './PathConvert'
export { PathCreator } from './PathCreator'
export { PathCommandDataHelper } from './PathCommandDataHelper'
export { PathCommandNodeHelper } from './PathCommandNodeHelper'
export { PathDrawer } from './PathDrawer'
export { PathBounds } from './PathBounds'
export { PathCorner } from './PathCorner'
export { BezierHelper } from './BezierHelper'
export { EllipseHelper } from './EllipseHelper'
export { RectHelper } from './RectHelper'
export { PathCommandMap, NeedConvertToCanvasCommandMap, PathNumberCommandMap, PathNumberCommandLengthMap } from './PathCommandMap'

// rewrite, prevent circular references

import { PathConvert } from './PathConvert'
import { PathCreator } from './PathCreator'
import { PathHelper } from './PathHelper'

import { IPathCommandData, IPathString } from '@leafer/interface'


export function path(path?: IPathCommandData | IPathString): PathCreator {
    return new PathCreator(path)
}

export const pen = path()

PathHelper.creator = path()
PathHelper.parse = PathConvert.parse
PathHelper.convertToCanvasData = PathConvert.toCanvasData