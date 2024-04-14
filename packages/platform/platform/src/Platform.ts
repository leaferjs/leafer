import { IPlatform } from '@leafer/interface'


export const Platform: IPlatform = {
    image: {
        maxHitCanvasSize: 100,
        maxCacheSize: 2560 * 1600,  // 2k
        maxPatternSize: 4096 * 2160, // 4k
        suffix: 'leaf',
        crossOrigin: 'anonymous'
    }
}