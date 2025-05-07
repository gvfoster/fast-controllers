import type { FastifyInstance, FastifyRequest, FastifyReply, 
    FastifySchema, RouteOptions, HTTPMethods } from 'fastify'

import FastControllerError_MethodHandlerNotDefined from './exceptions/FastControllerException_MethodHandlerNotDefined'


export type MethodSpecific = { [key in Lowercase<HTTPMethods>]?: unknown }


declare module 'fastify' {

    interface FastifySchema {
        socket?: {
            in?: {},
            out?: {}
        },
        body?: unknown | MethodSpecific;
        querystring?: unknown | MethodSpecific;
        params?: unknown | MethodSpecific;
        headers?: unknown | MethodSpecific;
        response?: unknown | MethodSpecific;
    }
}


/**
 * methodHandlers type
 */
type methodHandlers = (request: FastifyRequest, reply: FastifyReply) => void | Promise<unknown> | string

/**
 * Supported http methods
 */
export const METHODS: Array<Lowercase<HTTPMethods>> = ['delete', 'get', 'head', 'patch', 'post', 'put', 'options', 'search', 'trace', 'propfind', 'proppatch', 'mkcol', 'copy', 'move', 'lock', 'unlock']

/**
 * class FastController is the base class for all controllers 
 * implementing the `FastController` Fastify plugin.
 * 
 * This class attempts to adorn the Fastify Route Options object 
 * with some object orient functionality, and implements a structured route paradigm
 * that is defined by the controllers folder structure.   
 */
export default class FastController implements RouteOptions {


    /**************** Fastify Route 'Options' ****************/


    /**
     * The relative path that this controller will handle.  
     * 
     * This is set by plugin initialization and should not be changed.
     */
    public url: string = ''

    /**
     * The Json Schema FastifySchema.
     * 
     * This property is augmented by the FastController plugin to support schemas per http method.
     */
    public schema?: FastifySchema 

    /**
     * The Fastify Route Options websocket flag
     * 
     * The use of this property is not directly required. The FastController class will 
     * assume websocket support is desired if the webSocketHandler method is defined, 
     * and then set this property to true.
     */
    public websocket: boolean = false

    /**
     * The Fastify http method property that this controller will respond to
     */
    public method: Array<Uppercase<HTTPMethods>> | Uppercase<HTTPMethods>

    /**
     * The Fastify Route Option handle. 
     * Main handler for all requests
     * 
     * @param reqConn - The FastifyRequest or SocketStream
     * @param re - The FastifyReply or FastifyRequest
     * @returns - void | Promise<unknown> | string | object 
     */
    public handler = (requestOrConn: FastifyRequest, replyOrRequest: FastifyReply | FastifyRequest): void | Promise<unknown> | string | object => {

        // Determine if this is a websocket connection and if so, call the websocket handler
        // if ( this.websocket ) {

        //     return this.webSocketHandler(requestOrConn as SocketStream, replyOrRequest as FastifyRequest)
        // }

        const request = requestOrConn as FastifyRequest
        const reply = replyOrRequest as FastifyReply

        if (typeof this[request.method.toLowerCase() as keyof FastController] === 'function') {

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            return (this as unknown as { [key: string]: methodHandlers })[request.method.toLocaleLowerCase()]!(request, reply)
        }

        else if (typeof this.handle === 'function') {
            return this.handle(request, reply)
        }
    }


    /**************** End Fastify Route 'Options' /****************/



    /**************** FastController Members /****************/


    /**
     * Defines the shared scope for all derived controller classes, 
     * and is used to group related controllers together in a common scope.
     * 
     * The default scope is 'unsecured'
     */
    static scope = 'unsecured'

    /**
     * The Fastify Instance provided to the constructor during fastController initialization.
     * 
     * Because the default route object context mapping to the Fastify Instance is broken 
     * on all of the Fastify Route Option methods, this property is provided to allow access to the 
     * Instance. 
     * 
     * The Object context had to be broken to support object oriented goals. 
     */
    private _instance: FastifyInstance

    /**
     * Stores the route params for this controller.
     * 
     * This value is used by the FastController plugin to append any route param segments to the url.
     */
    public params?: { [key in Lowercase<HTTPMethods>]?: Array<string> | string } | Array<string> | string
    /**
     * FastController constructor
     * 
     * @param i - The FastifyInstance passed by the FastController plugin
     * @param route - The relative path that this controller will handle. resolved and provided by the FastController plugin
     */
    constructor(i: FastifyInstance, route: string) {

        this._instance = i
        this.url = route

        const methods = new Array<Uppercase<HTTPMethods>>()

        METHODS.forEach(method => {
            if (typeof this[method as keyof FastController] === 'function') {
                methods.push(method.toUpperCase() as Uppercase<HTTPMethods>)
            }
        })

        this.method = methods
        
        if (this.method.length === 0 && typeof this.handle !== 'function') {
            throw new FastControllerError_MethodHandlerNotDefined(this.constructor['name'])
        }

        this.init()
    }
    /**
     * FastController init hook
     */
    protected init() { }
    /**
     * The FastifyInstance setter
     * 
     * @deprecated - This setter is not used and will be removed in a future release
     */
    set instance(i: FastifyInstance) {
        this._instance = i
    }
    /**
     * The FastifyInstance getter
     */
    get instance() {
        return this._instance
    }
    /**
     * Getter returns the array version of method property
     */
    public get methods(): Array<Uppercase<HTTPMethods>> {
        return Array.isArray(this.method) ? this.method : [this.method]
    }
    /**
     * Fastify Route Options preValidation hook
     * 
     * @param request - The FastifyRequest
     * @param reply - The FastifyReply
     * @param done - The Fastify done callback
     */
    public preValidation = (request: FastifyRequest, reply: FastifyReply, done: (err?: Error) => void): void | Promise<unknown> | string => {

        if (this.onPreValidation !== undefined && typeof this.onPreValidation === 'function') {
            return this.onPreValidation(request, reply, done)
        }

        done()
    }
    /**
     * override this method to handle the underlying preValidation hook from Fastify
     * 
     * @param request 
     * @param reply 
     * @param done 
     */
    public onPreValidation?(request: FastifyRequest, reply: FastifyReply, done: (err?: Error) => void): void | Promise<unknown> | string



    /**************** HTTP Method specific handlers *******************/



    public delete?(request: FastifyRequest, reply: FastifyReply): void | Promise<unknown> | string | object
    public get?(request: FastifyRequest, reply: FastifyReply): void | Promise<unknown> | string | object
    public head?(request: FastifyRequest, reply: FastifyReply): void | Promise<unknown> | string | object
    public patch?(request: FastifyRequest, reply: FastifyReply): void | Promise<unknown> | string | object
    public post?(request: FastifyRequest, reply: FastifyReply): void | Promise<unknown> | string | object
    public put?(request: FastifyRequest, reply: FastifyReply): void | Promise<unknown> | string | object
    public options?(request: FastifyRequest, reply: FastifyReply): void | Promise<unknown> | string | object
    public search?(request: FastifyRequest, reply: FastifyReply): void | Promise<unknown> | string | object
    public trace?(request: FastifyRequest, reply: FastifyReply): void | Promise<unknown> | string | object
    public propfind?(request: FastifyRequest, reply: FastifyReply): void | Promise<unknown> | string | object
    public proppatch?(request: FastifyRequest, reply: FastifyReply): void | Promise<unknown> | string | object
    public mkcol?(request: FastifyRequest, reply: FastifyReply): void | Promise<unknown> | string | object
    public copy?(request: FastifyRequest, reply: FastifyReply): void | Promise<unknown> | string | object
    public move?(request: FastifyRequest, reply: FastifyReply): void | Promise<unknown> | string | object
    public lock?(request: FastifyRequest, reply: FastifyReply): void | Promise<unknown> | string | object
    public unlock?(request: FastifyRequest, reply: FastifyReply): void | Promise<unknown> | string | object
    public handle?(request: FastifyRequest, reply: FastifyReply): void | Promise<unknown> | string | object

}

