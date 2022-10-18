"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const FastController_1 = __importDefault(require("./FastController"));
class SecureFastController extends FastController_1.default {
    static scope = 'secured';
    onPreValidation(request, reply, done) {
        done();
    }
}
exports.default = SecureFastController;
