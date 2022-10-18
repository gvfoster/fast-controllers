import FastControllerError from './FastControllerError'


class FastControllerError_InvalidControllerPath extends FastControllerError {
    
    override name = 'FastControllerError_InvalidControllerPath'
    path: string

    constructor(path: string) {

        super(`FastController path: '${path}' is not valid`)
        this.path = path
    }
}

export default FastControllerError_InvalidControllerPath