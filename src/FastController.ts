import type { FastifyInstance, FastifyReply, FastifyRequest, FastifySchema } from 'fastify'

import FastControllerError_MethodHandlerNotDefined from './errors/FastControllerError_MethodHandlerNotDefined'


type methodHandlers = (request: FastifyRequest, reply: FastifyReply) =>  void | Promise<unknown> | string

const METHODS = ['delete', 'get', 'head', 'patch', 'post', 'put', 'options', 'search', 'trace', 'propfind', 'proppatch', 'mkcol', 'copy', 'move', 'lock', 'unlock']

/**
 * 
 * class FastController is the base class for all controllers 
 * implementing the `fastController` plugin
 */
class FastController {

    /**
     * Defines the shared scope for all derived controller classes
     */
    static scope = 'unsecured'

    /**
     * The Fastify instance provided to the constructor
     */
    private _instance: FastifyInstance 

    /**
     * The relative path that this controller will handle  
     */
    public url = '' 

    /**
     * The FastifySchema
     */
    public schema: FastifySchema = {}

    /**
     * The http methods that this controller will respond to
     */
    public method: Array<string> = []

    constructor( i: FastifyInstance, route: string ) {

        this._instance = i
        this.url = route

        METHODS.forEach( method => {
            if(typeof this[method as keyof FastController] === 'function' ) {
                this.method.push(method.toUpperCase())
            }  
        })

        if(this.method.length === 0 && typeof this.handle !== 'function') {
            throw new FastControllerError_MethodHandlerNotDefined(this.constructor['name'])
        }
    }

    set instance(i:FastifyInstance) {
        this._instance = i
    }

    get instance() {
        return this._instance
    }

    public handler = (request: FastifyRequest, reply: FastifyReply): void | Promise<unknown> | string | object => {
      
        if( typeof this[request.method.toLowerCase() as keyof FastController] === 'function') {

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            return (this as unknown as {[key:string]: methodHandlers})[request.method.toLocaleLowerCase()]!(request, reply)
        }

        else if(typeof this.handle === 'function') {
            return this.handle(request, reply)
        }
    }
    
    public preValidation = (request: FastifyRequest, reply: FastifyReply, done: (err?:Error)=>void ) : void | Promise<unknown> | string => {
        if(typeof this.onPreValidation === 'function') {
            return this.onPreValidation(request, reply, done)
        }

        done()
    }

    public onPreValidation?(request: FastifyRequest, reply: FastifyReply, done: (err?:Error)=>void ) : void | Promise<unknown> | string 

    public get?(request: FastifyRequest, reply: FastifyReply): void | Promise<unknown> | string | object

    public head?(request: FastifyRequest, reply: FastifyReply): void | Promise<unknown> | string

    public patch?(request: FastifyRequest, reply: FastifyReply): void | Promise<unknown> | string

    public post?(request: FastifyRequest, reply: FastifyReply): void | Promise<unknown> | string

    public put?(request: FastifyRequest, reply: FastifyReply): void | Promise<unknown> | string

    public options?(request: FastifyRequest, reply: FastifyReply): void | Promise<unknown> | string

    public search?(request: FastifyRequest, reply: FastifyReply): void | Promise<unknown> | string

    public trace?(request: FastifyRequest, reply: FastifyReply): void | Promise<unknown> | string

    public propfind?(request: FastifyRequest, reply: FastifyReply): void | Promise<unknown> | string

    public proppatch?(request: FastifyRequest, reply: FastifyReply): void | Promise<unknown> | string

    public mkcol?(request: FastifyRequest, reply: FastifyReply): void | Promise<unknown> | string

    public copy?(request: FastifyRequest, reply: FastifyReply): void | Promise<unknown> | string

    public move?(request: FastifyRequest, reply: FastifyReply): void | Promise<unknown> | string

    public lock?(request: FastifyRequest, reply: FastifyReply): void | Promise<unknown> | string

    public unlock?(request: FastifyRequest, reply: FastifyReply): void | Promise<unknown> | string

    public handle?(request: FastifyRequest, reply: FastifyReply): void | Promise<unknown> | string | object

}

export default FastController