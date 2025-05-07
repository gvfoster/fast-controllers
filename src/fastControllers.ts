import path from 'node:path'
import fs from 'node:fs'

import type { FastifyInstance, FastifyPluginOptions, HTTPMethods, RouteOptions } from 'fastify'

import type FastController from './FastController'
import FastControllerError_InvalidControllerPath from './exceptions/FastControllerException_InvalidControllerPath'
import { METHODS } from './FastController'

type FastControllerModule = { controller: typeof FastController, route: string }
type FastControllerOptions = FastifyPluginOptions & {
    path: string,
}

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
export default function fastControllers(instance: FastifyInstance, options: FastControllerOptions) {

    /**
     * Validate the controller path
     */
    if (!options || !options.path || !path.isAbsolute(options.path)) {
        throw new FastControllerError_InvalidControllerPath(options.path || 'undefined')
    }

    /**
     * Scan the controller path for all controller files
     */
    return scanControllers(options.path)

        /**
         * Import each module and return an array of modules with routes  
         */
        .then(paths => {

            return Promise.all(paths.map(path => {
                return import(path).then(module => {

                    return {
                        controller: module.default,
                        route: path.substring(options.path.length)
                        .toLowerCase()
                        .replace(/index\/?$/, '') 
                        .replace(/\\/g, '/')
                        .replace(/\/+$/, '')
                    } as FastControllerModule
                })
            }))
        })
        /**
         * Split the modules array into an array of FastControllerModules indexed by scope 
         */
        .then(modules => {

            const scopedModules: { [index: string]: Array<FastControllerModule> } = {}

            modules.forEach(module => {
                if (!scopedModules[module.controller.scope])
                    scopedModules[module.controller.scope] = new Array<FastControllerModule>()

                scopedModules[module.controller.scope]?.push(module)
            })

            return scopedModules
        })
        /**
         * Return a consolidated promise for all controller scopes
         */
        .then( scopedModules => {

            return Promise.all(Object.keys(scopedModules).map(scope => {
                return instance.register((_scope, _, next) => {
                    scopedModules[scope]?.forEach(module => {

                        /**
                         * Create an instance of this controller so we can access the
                         * methods and schema properties.
                         */
                        const controller = new module.controller(instance, module.route) as FastController
                        //const methods = controller.methods

                        /**
                         * If the schema property is not defined, then we create one controller instance
                         * for this module. 
                         * 
                         * If the schema property is defined, for now we simply create a controller instance 
                         * for each method defined in the methods array.
                         * 
                         * TODO: Write some complex logic to minimize the number of controller instances.
                         */
                        if (!controller.schema) {

                            _scope.route(controller as RouteOptions)
                        }

                        else {

                            controller.methods.forEach( method => {

                                const controllerInstance = new module.controller(instance, module.route) as FastController
                                _scope.route( prepareController( controllerInstance, method ) )
                            })
                        }
                    })

                next()
            })
        }))
    })
}


/**
 * Scan the controller path for all controller files and return an array of controller paths
 * 
 * @param controllerPath - The path to the controller directory
 * @returns A new Promise that resolves to an array of controller paths
 */
function scanControllers(controllerPath: string): Promise<Array<string>> {

    return new Promise<Array<string>>((resolve) => {

        /**
         * Recursively scan the controller path for all controller files and return an array of controller paths
         * @param cPath - The path to the controller directory
         * @returns An array of controller paths
         */
        function scan(cPath: string): Array<string> {

            const paths = new Array<string>()
            fs.readdirSync(cPath, { withFileTypes: true }).forEach(entry => {

                if (entry.isDirectory() && !entry.name.startsWith('.')) {
                    paths.push(...scan(path.join(cPath, entry.name)))
                }

                else if (entry.isFile() /* && !entry.name.startsWith('index', 0) */ && !entry.name.endsWith('.map')) {

                    let modulePath = path.join(cPath, entry.name)
                    paths.push(modulePath.substring(0, modulePath.lastIndexOf('.')))
                }
            })

            return paths
        }

        // Start the scan
        resolve(scan(controllerPath))
    })
}
/**
 * Prepare a controller for registration with Fastify
 * 
 * @param controller - The controller to prepare
 * @param method - The method to prepare the controller for
 * @returns The prepared controller
 */
function prepareController(controller: FastController, method: HTTPMethods): RouteOptions {

    // Remove all but this method from the RouteOptions method array
    controller.method = method.toUpperCase() as Uppercase<HTTPMethods>
    const lMethod = method.toLowerCase() as Lowercase<HTTPMethods>

    /**
     * Handle adding any params to the url
     */
    if ( controller.params ) {

        if (typeof controller.params === 'object' && controller.params.hasOwnProperty(lMethod)) {
            controller.params = (controller.params as { [key in Lowercase<HTTPMethods>]?: Array<string> })[lMethod] as Array<string>
        }

        // If we are a string now assume this is pre formatted and just append it to the url
        if (typeof controller.params === 'string') {
            controller.url = path.join(controller.url, controller.params)
        }

        // Otherwise must be an array then rewrite the url to include the params
        else if( Array.isArray(controller.params) ) {
            
            controller.url = path.join(controller.url, ...(controller.params as Array<string>).map(param => `:${param}`))
        }
    }

    /**
     * Handle modifying the params schema for this method
     */
    if( controller.schema?.params ) {

        // Replace the params schema with the method specific schema if it exists
        if( controller.schema.params.hasOwnProperty(lMethod) ) {
            controller.schema.params = (controller.schema.params as { [key in Lowercase<HTTPMethods>]: {} })[lMethod]
        }

        // Otherwise remove all other methods from the params schema
        else {

            // Remove all other methods from the params schema, but preserve root schema
            METHODS.forEach( method => {
                if( controller.schema?.params && controller.schema?.params.hasOwnProperty(method.toLowerCase()) ) {
                    delete (controller.schema.params as { [key in Lowercase<HTTPMethods>]: {} })[method]
                }
            })
        }
    }

    /**
     * Handle modifying the querystring schema for this method
     */
    if( controller.schema?.querystring ) {

        // Replace the querystring schema with the method specific schema if it exists
        if( controller.schema.querystring.hasOwnProperty(lMethod) ) {
            controller.schema.querystring = (controller.schema.querystring as { [key in Lowercase<HTTPMethods>]: {} })[lMethod]
        }

        // Otherwise remove all other methods from the querystring schema
        else {

            METHODS.forEach( method => {
                if( controller.schema?.querystring && controller.schema?.querystring.hasOwnProperty(method.toLowerCase()) ) {
                    delete (controller.schema.querystring as { [key in Lowercase<HTTPMethods>]: {} })[method]
                }
            })
        }
    }

    /**
     * Handle modifying the response schema for this method
     */
    if ( controller.schema?.response ) {

        // Replace the response schema with the method specific schema if it exists
        if( controller.schema.response.hasOwnProperty(lMethod) ) {
            controller.schema.response = (controller.schema.response as { [key in Lowercase<HTTPMethods>]: {} })[lMethod]
        }

        // Otherwise, if there is no method specific response schema, remove all other methods from the response schema
        else {

            METHODS.forEach( method => {
                if( controller.schema?.response && controller.schema?.response.hasOwnProperty(method.toLowerCase()) ) {
                    delete (controller.schema.response as { [key in Lowercase<HTTPMethods>]: {} })[method]
                }
            })
        }
    }

    /**
     * Remove the schema.body from the get controller so it does not cause an exception 
     */
    if ( controller.method === 'GET' ) {

        // Remove the schema.body from the get controller it is not needed
        if (controller.schema?.body) {
            delete controller.schema.body
        }
    }

    /**
     * Determine if the controller defines a body schema
     */ 
    if(controller.schema?.body) {

        // Replace the body schema with the method specific schema if it exists
        if(controller.schema.body.hasOwnProperty(lMethod) ) {
            controller.schema.body = (controller.schema.body as { [key in Lowercase<HTTPMethods>]: {} })[lMethod]
        }

        // Otherwise remove all other methods from the body schema
        else {

            METHODS.forEach( method => {
                if( controller.schema?.body && controller.schema?.body.hasOwnProperty(method.toLowerCase()) ) {
                    delete (controller.schema.body as { [key in Lowercase<HTTPMethods>]: {} })[method]
                }
            })

            if( Object.keys(controller.schema.body).length === 0 ) {
                delete controller.schema.body
            }
        }
    }

    return controller as RouteOptions
}