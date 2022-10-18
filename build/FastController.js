"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const FastControllerError_MethodHandlerNotDefined_1 = __importDefault(require("./errors/FastControllerError_MethodHandlerNotDefined"));
const METHODS = ['delete', 'get', 'head', 'patch', 'post', 'put', 'options', 'search', 'trace', 'propfind', 'proppatch', 'mkcol', 'copy', 'move', 'lock', 'unlock'];
/**
 *
 * class FastController is the base class for all controllers
 * implementing the `fastController` plugin
 */
class FastController {
    /**
     * Defines the shared scope for all derived controller classes
     */
    static scope = 'unsecured';
    /**
     * The Fastify instance provided to the constructor
     */
    _instance;
    /**
     * The relative path that this controller will handle
     */
    url = '';
    /**
     * The FastifySchema
     */
    schema = {};
    /**
     * The http methods that this controller will respond to
     */
    method = [];
    constructor(i, route) {
        this._instance = i;
        this.url = route;
        METHODS.forEach(method => {
            if (typeof this[method] === 'function') {
                this.method.push(method.toUpperCase());
            }
        });
        if (this.method.length === 0 && typeof this.handle !== 'function') {
            throw new FastControllerError_MethodHandlerNotDefined_1.default(this.constructor['name']);
        }
    }
    set instance(i) {
        this._instance = i;
    }
    get instance() {
        return this._instance;
    }
    handler = (request, reply) => {
        if (typeof this[request.method.toLowerCase()] === 'function') {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            return this[request.method.toLocaleLowerCase()](request, reply);
        }
        else if (typeof this.handle === 'function') {
            return this.handle(request, reply);
        }
    };
    preValidation = (request, reply, done) => {
        if (typeof this.onPreValidation === 'function') {
            return this.onPreValidation(request, reply, done);
        }
        done();
    };
}
exports.default = FastController;
