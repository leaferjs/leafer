export const FileHelper = {

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