import { IExportFileType, IStringMap, IExportOptions } from '@leafer/interface'

export const FileHelper = {

    opacityTypes: ['png', 'webp', 'svg'] as IExportFileType[],

    upperCaseTypeMap: {} as IStringMap,

    mineType(type: string): string {
        if (!type || type.startsWith('image')) return type
        if (type === 'jpg') type = 'jpeg'
        return 'image/' + type
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

const F = FileHelper

F.opacityTypes.forEach(type => F.upperCaseTypeMap[type] = type.toUpperCase())