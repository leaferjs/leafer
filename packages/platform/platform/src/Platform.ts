import { IPlatform } from '@leafer/interface'


export const Platform: IPlatform = {
    toURL(text: string, fileType?: 'text' | 'svg'): string {
        let url = encodeURIComponent(text)
        if (fileType === 'text') url = 'data:text/plain;charset=utf-8,' + url
        else if (fileType === 'svg') url = 'data:image/svg+xml,' + url
        return url
    },
    image: {
        hitCanvasSize: 100,
        maxCacheSize: 2560 * 1600,  // 2k
        maxPatternSize: 4096 * 2160, // 4k
        suffix: '', // leaf
        crossOrigin: 'anonymous'
    }
}