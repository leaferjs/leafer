import { IPathCommandData, IPathCreator } from '@leafer/interface'

export const PathHelper = {
    // index.ts rewrite
    creator: {} as IPathCreator,
    parse(_pathString: string, _curveMode?: boolean): IPathCommandData { return undefined },
    convertToCanvasData(_old: IPathCommandData, _curveMode?: boolean): IPathCommandData { return undefined }
}