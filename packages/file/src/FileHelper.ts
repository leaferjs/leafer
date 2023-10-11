import { IExportFileType, IStringMap } from '@leafer/interface'

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
    }

}

FileHelper.opacityTypes.forEach(type => FileHelper.upperCaseTypeMap[type] = type.toUpperCase())