import path from 'node:path'
import fs from 'node:fs'

import type { FastifyInstance, FastifyPluginOptions, RouteOptions } from 'fastify'

import type FastController from './FastController'
import FastControllerError_InvalidControllerPath from './errors/FastControllerError_InvalidControllerPath'


type FastControllerModule = { controller: typeof FastController, route: string }

type FastControllerOptions = {
    path: string,
    logger?: (string) 
}

let logger = ( message: string ) => {}

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
async function fastControllers(instance: FastifyInstance, options: FastifyPluginOptions, done: (err?: Error) => void) {

    const opts = options as FastControllerOptions

    if (!options || !opts.path || !path.isAbsolute(opts.path)) {
        throw new FastControllerError_InvalidControllerPath(opts.path || 'undefined')
    }

    if(opts.logger && typeof opts.logger == 'function') {
        logger = opts.logger
    }

    new Promise<Array<string>>((resolve, reject) => {

        function scan(path: string): Array<string> {

            const paths = new Array<string>()
            const dir = fs.opendirSync(path)

            let entry = dir.readSync()
            while (entry) {

                if (entry.isDirectory() && !entry.name.startsWith('.')) {
                    paths.push(...scan(dir.path + '/' + entry.name))
                }

                else if (entry.isFile() && !entry.name.startsWith('index', 0)) {

                    let modulePath = (dir.path + '/' + entry.name)
                    paths.push(modulePath.substring(0, modulePath.lastIndexOf('.')))
                }

                entry = dir.readSync()
            }

            dir.close()
            return paths
        }

        resolve(scan(opts.path))
    })

        // Then import each module and return an array of modules with routes  
        .then(paths => {

            return Promise.all(paths.map(path => {
                return import(path).then(module => {
                    return {
                        controller: module.default,
                        route: path.substring(opts.path.length).toLowerCase()
                    } as FastControllerModule
                })
            }))
        })

        // Split the modules array into an array of FastControllerModules indexed by scope 
        .then(modules => {

            const scopedModules: { [index: string]: Array<FastControllerModule> } = {}

            modules.forEach(module => {
                if (!scopedModules[module.controller.scope])
                    scopedModules[module.controller.scope] = new Array<FastControllerModule>()

                scopedModules[module.controller.scope]?.push(module)
            })

            return scopedModules
        })

        // Return a consolidated promise for all controller scopes
        .then(scopedModules => {

            return Promise.all(Object.keys(scopedModules).map(scope => {
                return instance.register((_scope, options, next) => {
                    scopedModules[scope]?.forEach(module => {

                        const controller = new module.controller(instance, module.route) as FastController
                        const methods = controller.methods

                        if(methods.includes('GET') && methods.includes('POST') || methods.includes('PUT') || methods.includes('DELETE') || methods.includes('PATCH')) {
                            
                            const getController = new module.controller(instance, module.route) as FastController
                            delete getController.schema.body
                            getController.method = getController.methods.filter(method => !['POST', 'PUT', 'DELETE', 'PATCH'].includes(method) )

                            _scope.route(getController as RouteOptions)

                            const bodyController = new module.controller(instance, module.route) as FastController
                            delete bodyController.schema.querystring
                            bodyController.method = bodyController.methods.filter(method => method !== 'GET')

                            _scope.route(bodyController as RouteOptions)
                        }
                        else {

                            _scope.route(controller as RouteOptions)
                        }
                    })

                    next()
                })
            }))
        })

        .catch(err => {
            console.error(err)
            done(err)
        })

        .then(() => { done() })
}

export default fastControllers