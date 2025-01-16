import FastControllerException from './FastControllerException'


class FastControllerException_MethodHandlerNotDefined extends FastControllerException {
    
    override name = 'FastControllerException_MethodHandlerNotDefined'
    controllerName: string

    constructor(controllerName: string) {

        super(`FastController '${controllerName}' must define at least 1 http method, or define the handle method`)
        this.controllerName = controllerName
    }
}

export { FastControllerException_MethodHandlerNotDefined }
export default FastControllerException_MethodHandlerNotDefined