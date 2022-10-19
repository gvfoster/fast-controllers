/* eslint-disable indent */
import path from 'node:path'
import fs from 'node:fs'

import type { FastifyInstance, FastifyPluginOptions, RouteOptions } from 'fastify'
 
import type FastController from './FastController'
import FastControllerError_InvalidControllerPath from './errors/FastControllerError_InvalidControllerPath'

type FastControllerModule = {controller: typeof FastController, route: string}

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
async function fastControllers( instance: FastifyInstance, options: FastifyPluginOptions & {path: string}, done: (err?:Error) => void ) {

    if( !options || !options.path || !path.isAbsolute(options.path) ) {
        throw new FastControllerError_InvalidControllerPath(options.path || 'undefined')
    }

    new Promise<Array<string>>( (resolve, reject) => {

        function scan(path: string): Array<string> {
        
            const paths = new Array<string>() 
            const dir = fs.opendirSync(path)
        
            let entry = dir.readSync()
            while(entry) {
                
                if(entry.isDirectory() && !entry.name.startsWith('.')) {
                    paths.push( ...scan(dir.path + '/' + entry.name) )
                }
    
                else if(entry.isFile() && !entry.name.startsWith('index', 0) ) {
    
                    let modulePath = (dir.path + '/' + entry.name)
                    paths.push( modulePath.substring(0, modulePath.lastIndexOf('.')) )
                }
                
                entry = dir.readSync()
            }
    
            dir.close()
            return paths
        }

        resolve(scan(options.path))
    })

    // Then import each module and return an array of modules with routes  
    .then( paths => { 
      
        return Promise.all( paths.map( path => {
            return import(path).then( module => {
                return {
                    controller: module.default, 
                    route: path.substring( options.path.length ).toLowerCase()
                } as FastControllerModule
            }) 
        }))
    })        
        
    // Split the modules array into an array of FastControllerModules indexed by scope 
    .then( modules => {

        const scopedModules: { [index:string]: Array<FastControllerModule> } = {}

        modules.forEach( module => {
            if(!scopedModules[module.controller.scope]) 
                scopedModules[module.controller.scope] = new Array<FastControllerModule>()
            
            scopedModules[module.controller.scope]?.push(module)
        })
 
        return scopedModules
    })

    // Return a consolidated promise for all controller scopes
    .then( scopedModules => {

        return Promise.all( Object.keys(scopedModules).map( scope => {
            return instance.register( ( _scope, options, next) => {
                scopedModules[scope]?.forEach( module => {
                    _scope.route(new module.controller(_scope, module.route) as RouteOptions)
                })
                
                next()
            })
        }))
    })

    .catch( err => {
        console.error(err)
        done(err)
    })

    .then( () => { done() } )
}

export default fastControllers