import { IBooleanMap } from '@leafer/interface'


const downKeyMap: IBooleanMap = {}

export const Keyboard = {

    hold: 0,

    isHoldSpaceKey(): boolean {
        return Keyboard.hasDownCode('Space')
    },

    hasDownCode(code: string): boolean {
        return downKeyMap[code]
    },

    setDownCode(code: string): void {
        if (!downKeyMap[code]) {
            this.hold++
            downKeyMap[code] = true
        }
    },

    setUpCode(code: string): void {
        this.hold--
        downKeyMap[code] = false
    }

}