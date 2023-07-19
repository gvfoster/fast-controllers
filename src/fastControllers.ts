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

let logger = (message: string) => { }

const bodyMethods = ['POST', 'PUT', 'DELETE', 'PATCH']

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

    if (opts.logger && typeof opts.logger == 'function') {
        logger = opts.logger
    }

    new Promise<Array<string>>((resolve, reject) => {

        function scan(contPath: string): Array<string> {

            const paths = new Array<string>()
            fs.readdirSync(contPath, { withFileTypes: true }).forEach( entry => {

                if (entry.isDirectory() && !entry.name.startsWith('.')) {
                    paths.push(...scan( path.join(contPath, entry.name) ) )
                }

                else if (entry.isFile() && !entry.name.startsWith('index', 0)) {

                    let modulePath = path.join(contPath, entry.name)
                    paths.push( modulePath.substring(0, modulePath.lastIndexOf('.')) )
                }
            })

            return paths
        }

        resolve(scan(opts.path))
    })

        // Then import each module and return an array of modules with routes  
        .then( paths => {

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
        .then( modules => {

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

                        // Create a new instance of the controller to get the methods
                        const controller = new module.controller(instance, module.route) as FastController
                        const methods = controller.methods

                        /**
                         * Assuming if the controller defines schemas for both querystring and body
                         * then it will also define multiple methods for handling requests
                         * 
                         * We will define a controller for each method defined in the methods array
                         */
                        if (controller.schema && controller.schema.querystring && controller.schema.body && methods.length > 1) {

                            controller.methods.forEach(method => {

                                // Create a new controller instance for this method    
                                const cont = new module.controller(instance, module.route) as FastController

                                // Remove all but this method from the RouteOptions method array
                                cont.method = method

                                // Determine if the controller defines a response schema
                                if (cont.schema.response) {

                                    // If so, then determine if the response schema defines this method
                                    for (let key of Object.keys(cont.schema.response)) {

                                        if (key.toLowerCase() === method.toLowerCase()) {

                                            // If so, then set the response schema to this methods schema
                                            cont.schema.response = (cont.schema.response as { [key: string]: {} })[key]
                                            break
                                        }

                                        // Determine if this key is a number and delete if not
                                        else if (!Number.isInteger(Number(key))) {

                                            delete (cont.schema.response as { [key: string]: {} })[key]
                                        }
                                    }
                                }

                                // Special case for the get method
                                if (method === 'GET') {

                                    // Remove the schema.body from the get controller it is not needed
                                    if (cont.schema.body) {
                                        delete cont.schema.body
                                    }
                                }

                                else {

                                    // Remove the schema.querystring from the body controller it is not needed
                                    if (cont.schema.querystring) {
                                        delete cont.schema.querystring
                                    }

                                    // Determine if the controller defines a response schema
                                    if (cont.schema.body) {

                                        // If so, then determine if the response schema defines this method
                                        for (let key of Object.keys(cont.schema.body)) {

                                            if (key.toLowerCase() === method.toLowerCase()) {

                                                // If so, then set the response schema to this methods schema
                                                cont.schema.body = (cont.schema.body as { [key: string]: {} })[key]
                                                break
                                            }
                                        }
                                    }
                                }

                                _scope.route(cont as RouteOptions)
                            })
                        }

                        // Add the single controller to the scope
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