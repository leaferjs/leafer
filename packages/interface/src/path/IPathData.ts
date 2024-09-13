import { IPathCommandData } from './IPathCommand'
export interface IMotionPathData {
    total: number
    segments: number[]  // 每个命令对应一个片段距离
    data: IPathCommandData // M L C Z 命令的路径数据
}