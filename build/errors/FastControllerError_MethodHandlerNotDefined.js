"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const FastControllerError_1 = __importDefault(require("./FastControllerError"));
class FastControllerError_MethodHandlerNotDefined extends FastControllerError_1.default {
    name = 'FastControllerError_MethodHandlerNotDefined';
    controllerName;
    constructor(controllerName) {
        super(`FastController '${controllerName}' must define at least 1 http method, or define the handle method`);
        this.controllerName = controllerName;
    }
}
exports.default = FastControllerError_MethodHandlerNotDefined;
