"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable indent */
const node_path_1 = __importDefault(require("node:path"));
const node_fs_1 = __importDefault(require("node:fs"));
const FastControllerError_InvalidControllerPath_1 = __importDefault(require("./errors/FastControllerError_InvalidControllerPath"));
/**
 * FastControllers Fastify Plugin
 * This plugin allows for defining, and registering routes through
 * the user defined controllers directory structure
 *
 * ```
 * // example usage
 * fastify.register(fastControllers, { path: 'path to projects controller directory' } )
 * ```
 * @param instance - The provided Fastify Instance
 * @param options  - The provided Fastify options object
 * @param done     - The plugin done callback
 */
async function fastControllers(instance, options, done) {
    if (!options || !options.path || !node_path_1.default.isAbsolute(options.path)) {
        throw new FastControllerError_InvalidControllerPath_1.default(options.path || 'undefined');
    }
    // Scan the controllers directory and get an array of module paths to import
    (async function scan(path) {
        const paths = new Array();
        const dir = node_fs_1.default.opendirSync(path);
        let entry = dir.readSync();
        while (entry) {
            if (entry.isDirectory() && !entry.name.startsWith('.')) {
                paths.concat(await scan(dir.path + '/' + entry.name));
            }
            else if (entry.isFile() && !entry.name.includes('index')) {
                paths.push(path.substring(0, (dir.path + '/' + entry.name).lastIndexOf('.')));
            }
            entry = dir.readSync();
        }
        return paths;
    })(options.path)
        // Then import each module and return an array of modules with routes  
        .then(paths => {
        console.log(paths);
        return Promise.all(paths.map(paths => {
            return Promise.resolve().then(() => __importStar(require(paths))).then(module => {
                return {
                    controller: module.default,
                    route: paths.substring((paths.indexOf('controllers') + 11)).toLowerCase()
                };
            });
        }));
    })
        // Split the modules array into an array of FastControllerModules indexed by scope 
        .then(modules => {
        const scopedModules = {};
        modules.forEach(module => {
            if (!scopedModules[module.controller.scope])
                scopedModules[module.controller.scope] = new Array();
            scopedModules[module.controller.scope]?.push(module);
        });
        return scopedModules;
    })
        // Return a consolidated promise for  all controller scopes
        .then(scopedModules => {
        return Promise.all(Object.keys(scopedModules).map(scope => {
            return instance.register((_scope, _, next) => {
                scopedModules[scope]?.forEach(module => {
                    _scope.route(new module.controller(_scope, module.route));
                });
                next();
            });
        }));
    })
        // Call the plugin done call back
        .finally(() => { done(); });
}
exports.default = fastControllers;
