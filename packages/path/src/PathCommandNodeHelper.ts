import { IPathCommandNode, IPathCommandData, IPathNodeBase } from '@leafer/interface'

// 路径节点辅助(适合可视化编辑)，提供接口（需重写）
export const PathCommandNodeHelper = {
    toCommand(_nodes: IPathCommandNode[] | IPathNodeBase[]): IPathCommandData {
        return []
    },
    toNode(_data: IPathCommandData): IPathCommandNode[] {
        return []
    }
}