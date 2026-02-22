import { IExportFileType, IStringMap, IExportOptions } from '@leafer/interface'

export const FileHelper = {

    alphaPixelTypes: ['png', 'webp', 'svg'] as IExportFileType[],

    upperCaseTypeMap: {} as IStringMap,

    mimeType(type: string, base: string = 'image'): string {
        if (!type || type.startsWith(base)) return type
        if (type === 'jpg') type = 'jpeg'
        return base + '/' + type
    },

    fileType(filename: string): string {
        const l = filename.split('.')
        return l[l.length - 1]
    },

    isOpaqueImage(filename: string): boolean {
        const type = F.fileType(filename)
        return ['jpg', 'jpeg'].some(item => item === type)
    },

    getExportOptions(options?: IExportOptions | number | boolean): IExportOptions {
        switch (typeof options) {
            case 'object': return options
            case 'number': return { quality: options }
            case 'boolean': return { blob: options }
            default: return {}
        }
    }

}

const F = FileHelper;
(F as any).mineType = F.mimeType // 兼容老代码，后面可以移除

F.alphaPixelTypes.forEach(type => F.upperCaseTypeMap[type] = type.toUpperCase())