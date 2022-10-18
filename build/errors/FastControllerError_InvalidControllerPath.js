"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const FastControllerError_1 = __importDefault(require("./FastControllerError"));
class FastControllerError_InvalidControllerPath extends FastControllerError_1.default {
    name = 'FastControllerError_InvalidControllerPath';
    path;
    constructor(path) {
        super(`FastController path: '${path}' is not valid`);
        this.path = path;
    }
}
exports.default = FastControllerError_InvalidControllerPath;
