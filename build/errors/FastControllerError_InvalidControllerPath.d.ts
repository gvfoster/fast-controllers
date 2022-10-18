import FastControllerError from './FastControllerError';
declare class FastControllerError_InvalidControllerPath extends FastControllerError {
    name: string;
    path: string;
    constructor(path: string);
}
export default FastControllerError_InvalidControllerPath;
