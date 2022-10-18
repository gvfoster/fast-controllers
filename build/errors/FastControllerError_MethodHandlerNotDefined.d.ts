import FastControllerError from './FastControllerError';
declare class FastControllerError_MethodHandlerNotDefined extends FastControllerError {
    name: string;
    controllerName: string;
    constructor(controllerName: string);
}
export default FastControllerError_MethodHandlerNotDefined;
