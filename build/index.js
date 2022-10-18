"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecureFastController = exports.FastController = exports.fastControllers = void 0;
const fastControllers_1 = __importDefault(require("./fastControllers"));
exports.fastControllers = fastControllers_1.default;
exports.default = fastControllers_1.default;
var FastController_1 = require("./FastController");
Object.defineProperty(exports, "FastController", { enumerable: true, get: function () { return __importDefault(FastController_1).default; } });
var SecureFastController_1 = require("./SecureFastController");
Object.defineProperty(exports, "SecureFastController", { enumerable: true, get: function () { return __importDefault(SecureFastController_1).default; } });
