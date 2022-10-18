import FastControllerError from './FastControllerError'


class FastControllerError_MethodHandlerNotDefined extends FastControllerError {
    
    override name = 'FastControllerError_MethodHandlerNotDefined'
    controllerName: string

    constructor(controllerName: string) {

        super(`FastController '${controllerName}' must define at least 1 http method, or define the handle method`)
        this.controllerName = controllerName
    }
}

export default FastControllerError_MethodHandlerNotDefined