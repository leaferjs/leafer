import { IPathCommandNode, IPathCommandData } from '@leafer/interface'

// 路径节点辅助(适合可视化编辑)，提供接口（需重写）
export const PathCommandNodeHelper = {
    toCommand(_nodes: IPathCommandNode[]): IPathCommandData {
        return []
    },
    toNode(_data: IPathCommandData): IPathCommandNode[] {
        return []
    }
}