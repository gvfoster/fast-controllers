declare class FastControllerError extends Error {
    name: string;
    constructor(message: string);
}
export default FastControllerError;
