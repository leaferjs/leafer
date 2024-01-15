export { PathHelper } from './PathHelper'
export { PathConvert } from './PathConvert'
export { PathCreator } from './PathCreator'
export { PathCommandDataHelper } from './PathCommandDataHelper'
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

PathHelper.creator = new PathCreator()
PathHelper.parse = PathConvert.parse
PathHelper.convertToCanvasData = PathConvert.toCanvasData
