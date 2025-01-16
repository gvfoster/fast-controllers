import FastControllerException from './FastControllerException'


class FastControllerException_InvalidControllerPath extends FastControllerException {
    
    override name = 'FastControllerException_InvalidControllerPath'
    path: string

    constructor(path: string) {

        super(`FastController path: '${path}' is not valid`)
        this.path = path
    }
}

export default FastControllerException_InvalidControllerPath
export { FastControllerException_InvalidControllerPath }