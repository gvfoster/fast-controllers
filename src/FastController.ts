import type { FastifyInstance, FastifyReply, FastifyRequest, FastifySchema } from 'fastify'

import FastControllerError_MethodHandlerNotDefined from './errors/FastControllerError_MethodHandlerNotDefined'
import { SocketStream } from '@fastify/websocket'
import FastControllerError from './errors/FastControllerError'


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
     * The Fastify Route Options websocket flag
     */ 
    public websocket: boolean = false

    /**
     * The http methods that this controller will respond to
     */
    public method: Array<string> | string

    /**
     * FastController constructor
     * 
     * @param i - The FastifyInstance
     * @param route - The relative path that this controller will handle
     */
    constructor( i: FastifyInstance, route: string ) {

        this._instance = i
        this.url = route

        if(this.webSocketHandler !== undefined && typeof this.webSocketHandler === 'function') {
        
            this.method = 'GET'
            this.websocket = true
        }
        else {

            const methods = new Array<string>()

            METHODS.forEach( method => {
                if(typeof this[method as keyof FastController] === 'function' ) {
                    methods.push(method.toUpperCase())
                }  
            })

            this.method = methods
        }

        if(this.method.length === 0 && typeof this.handle !== 'function') {
            throw new FastControllerError_MethodHandlerNotDefined(this.constructor['name'])
        }

        this.init()
    }

    /**
     * FastController init hook
     */
    protected init() {}

    /**
     * The FastifyInstance setter
     */
    set instance(i:FastifyInstance) {
        this._instance = i
    }

    /**
     * The FastifyInstance getter
     */
    get instance() {
        return this._instance
    }

    /**
     * The Fastify Route Option handle 
     * Main handler for all requests
     * 
     * @param reqConn - The FastifyRequest or SocketStream
     * @param re - The FastifyReply or FastifyRequest
     * @returns - void | Promise<unknown> | string | object 
     */
    public handler = (requestOrConn: FastifyRequest | SocketStream, replyOrRequest: FastifyReply | FastifyRequest): void | Promise<unknown> | string | object => {
    
        if(requestOrConn.socket !== undefined && typeof this.webSocketHandler === 'function') {
        
            return this.webSocketHandler(requestOrConn as SocketStream, replyOrRequest as FastifyRequest)
        }

        const request = requestOrConn as FastifyRequest
        const reply = replyOrRequest as FastifyReply

        if( typeof this[request.method.toLowerCase() as keyof FastController] === 'function') {

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            return (this as unknown as {[key:string]: methodHandlers})[request.method.toLocaleLowerCase()]!(request, reply)
        }

        else if(typeof this.handle === 'function') {
            return this.handle(request, reply)
        }
    }

    /**
     * Fastify Route Options preValidation hook
     * 
     * @param request - The FastifyRequest
     * @param reply - The FastifyReply
     * @param done - The Fastify done callback
     */
    public preValidation = (request: FastifyRequest, reply: FastifyReply, done: (err?:Error)=>void ) : void | Promise<unknown> | string => {
       
        if(this.onPreValidation !== undefined && typeof this.onPreValidation === 'function') {
            return this.onPreValidation(request, reply, done)
        }

        done()
    }

    /**
     * FastController plugin hook for handling websocket connections
     * override this method to handle the underlying preValidation hook from Fastify
     * 
     * @param request 
     * @param reply 
     * @param done 
     */
    public onPreValidation?(request: FastifyRequest, reply: FastifyReply, done: (err?:Error)=>void ) : void | Promise<unknown> | string 

    public delete?(request: FastifyRequest, reply: FastifyReply): void | Promise<unknown> | string | object
    
    public get?(request: FastifyRequest, reply: FastifyReply): void | Promise<unknown> | string | object
    //public get?(connection: SocketStream, req: FastifyRequest): void | Promise<unknown> | string | object

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


    /**************** Web Socket *******************/

    /**
     * fastController plugin hook for handling websocket connections
     * override this method to handle websocket connections
     * 
     * @param connection - The SocketStream
     * @param request - The FastifyRequest
     * @returns - void | Promise<unknown> | string | object
     */
    public webSocketHandler?(connection: SocketStream, request: FastifyRequest): void | Promise<unknown> | string | object

}

export default FastController