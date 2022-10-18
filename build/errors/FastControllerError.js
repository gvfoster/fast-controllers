"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class FastControllerError extends Error {
    name = 'FastControllerError';
    constructor(message) {
        super(message);
    }
}
exports.default = FastControllerError;
