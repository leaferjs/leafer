import { IBooleanMap } from '@leafer/interface'


const downKeyMap: IBooleanMap = {}

export class Keyboard {

    static isHoldSpaceKey(): boolean {
        return Keyboard.hasDownCode('Space')
    }

    static setDownCode(code: string): void {
        if (!downKeyMap[code]) downKeyMap[code] = true
    }

    static setUpCode(code: string): void {
        downKeyMap[code] = false
    }

    static hasDownCode(code: string): boolean {
        return downKeyMap[code]
    }

}