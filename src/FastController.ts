import type { FastifyInstance, FastifyRequest, FastifyReply, 
    FastifySchema, RouteOptions, HTTPMethods } from 'fastify'

import { SocketStream } from '@fastify/websocket'

import FastControllerError_MethodHandlerNotDefined from './errors/FastControllerError_MethodHandlerNotDefined'
import { ValidationFunction } from 'fastify/types/request'


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
    public handler = (requestOrConn: FastifyRequest | SocketStream, replyOrRequest: FastifyReply | FastifyRequest): void | Promise<unknown> | string | object => {

        // Determine if this is a websocket connection and if so, call the websocket handler
        if ( this.websocket ) {

            return this.webSocketHandler(requestOrConn as SocketStream, replyOrRequest as FastifyRequest)
        }

        const request = requestOrConn as FastifyRequest
        const reply = replyOrRequest as FastifyReply

        console.log(' Handler Method ' ,request.method.toLowerCase(), typeof this[request.method.toLowerCase() as keyof FastController] )

        if (typeof this[request.method.toLowerCase() as keyof FastController] === 'function') {

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            return (this as unknown as { [key: string]: methodHandlers })[request.method.toLocaleLowerCase()]!(request, reply)
        }

        else if (typeof this.handle === 'function') {
            return this.handle(request, reply)
        }
    }


    /**************** End Fastify Route 'Options' /****************



    /**************** FastController Members /****************


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

        /**
         * If the onSocketConnected method is defined, then this controller is a websocket controller
         */
        if (typeof this.onSocketConnected === 'function') {

            this.method = 'GET'
            this.websocket = true
        }
        else {

            const methods = new Array<Uppercase<HTTPMethods>>()

            METHODS.forEach(method => {
                if (typeof this[method as keyof FastController] === 'function') {
                    methods.push(method.toUpperCase() as Uppercase<HTTPMethods>)
                }
            })

            this.method = methods
        }

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



    /**************** Web Socket *******************/



    /**
     * Stores the websocket connections for this controller
     */
    protected sockets: Map<any, SocketStream> | null = null

    protected socketSchemaValidatorIn?: ValidationFunction
    protected socketSchemaValidatorOut?: ValidationFunction

    /**
     * compileSocketSchemas method compiles the socket schemas defined in the schema property
     * 
     * @returns - void
     */
    private compileSocketSchemas() {

        console.log('compileSocketSchemas: ', this.schema?.socket)

        return import('ajv').then(Ajv => {

            if ((!this.socketSchemaValidatorIn && !this.socketSchemaValidatorOut) && this.schema?.socket && (this.schema.socket.in || this.schema.socket.out)) {

                const ajv = new Ajv.default({
                    allErrors: true,
                    coerceTypes: false,
                    strict: false,
                    removeAdditional: true,
                    allowUnionTypes: true
                })

                if (this.schema?.socket?.in) {

                    console.log('compiling socket.in schema: ', this.schema.socket.in)
                    this.socketSchemaValidatorIn = ajv.compile(this.schema.socket.in, true)
                }

                if (this.schema?.socket?.out) {

                    console.log('compiling socket.out schema: ', this.schema.socket.out)
                    this.socketSchemaValidatorOut = ajv.compile(this.schema.socket.out!, true)
                }
            }
        })
    }

    /**
     * fastController plugin hook for handling websocket connections
     * override this method to handle websocket connections
     * 
     * @param connection - The SocketStream
     * @param request - The FastifyRequest
     * 
     * @returns - void | Promise<unknown> | string | object
     */
    public webSocketHandler(connection: SocketStream, request: FastifyRequest): void | Promise<unknown> | string | object {

        // Determine if the derived class has defined the onSocketConnected hook
        if (this.onSocketConnected !== undefined && typeof this.onSocketConnected === 'function') {

            // Attempt to compile any socket schemas
            return this.compileSocketSchemas().then(() => {

                // Call the onSocketConnected hook and get the desired key for this connection
                const key = this.onSocketConnected!(connection, request)

                // If the key is not defined then throw an error
                if (!key) throw new Error('onSocketConnected: key is undefined')

                // If the sockets property is not defined then create it
                if (this.sockets === null) {
                    this.sockets = new Map()
                }

                // Add the connection to the sockets map
                this.sockets.set(key, connection)

                // If the onSocketMessageReceived hook is defined then add a message handler to the socket
                if (this.onSocketMessageReceived !== undefined && typeof this.onSocketMessageReceived === 'function') {

                    connection.socket.on('message', (message: string, connection: SocketStream) => {

                        return this.onValidateIncomingSocketMessage(message, key)
                    })
                }

                // If the onSocketClose hook is defined then add a close handler to the socket
                if (this.onSocketDisconnected !== undefined && typeof this.onSocketDisconnected === 'function') {

                    connection.socket.on('close', (code: number, reason: string, connection: SocketStream) => {

                        if(this.sockets !== null && this.sockets.has(key)) {
                            this.sockets.delete(key)
                        }
                        
                        return this.onSocketDisconnected!(connection, key, code, reason)
                    })
                }

                return
            })
        }
    }

    /**
     * Validates incoming socket messages against the socket.in schema
     * 
     * @param connection - The SocketStream
     * @param message - The message to validate 
     * 
     * @returns - void
     */
    public onValidateIncomingSocketMessage(message: any, key: any) {

        if (message instanceof Buffer) {
            message = message.toString()
        }

        if (typeof message === 'string') {

            try {
                const result = JSON.parse(message)

                if (result !== undefined && typeof result === 'object') {

                    message = result
                }

                console.log('onValidateIncomingSocketMessage: parsed message: ', message)
            }
            catch (e) {

                console.log('onValidateIncomingSocketMessage: error parsing message: ', e)
            }
        }

        // If the socketSchemaValidatorIn is defined and is a function then validate the message
        if (this.socketSchemaValidatorIn !== undefined) {

            const result = this.socketSchemaValidatorIn(message)
            console.log('onValidateIncomingSocketMessage: result: ', result)

            if (!result) {

                const errors = this.socketSchemaValidatorIn.errors
                console.log('onValidateIncomingSocketMessage: errors: ', errors)

                const error = {
                    error: {
                        message: errors?.at(0)?.message || 'Invalid socket message'
                    }
                }

                console.error('onValidateIncomingSocketMessage: error: ', error)
                return this.onSocketMessageReceivedError(message, key, error)
            }
        }

        return this.onSocketMessageReceived!(message, key)
    }

    /**
     * Validates outgoing socket messages against the socket.out schema
     * 
     * @param message - The message to validate
     * @param key - The key value returned by the onSocketConnected hook
     * 
     * @returns - boolean
     */
    public socketValidateOutgoingMessage(message: any, key: any): boolean {

        if (this.socketSchemaValidatorOut !== undefined && typeof this.socketSchemaValidatorOut === 'function') {

            if (!this.socketSchemaValidatorOut(message)) {

                this.socketSendMessage(key, JSON.stringify(this.socketSchemaValidatorOut.errors))

                throw this.socketSchemaValidatorOut.errors
            }
        }

        return this.socketSendMessage(message, key)
    }

    /**
     * onSocketConnected Hook is called when a websocket connection is established
     * 
     * @param connection - The SocketStream
     * @param request - The FastifyRequest
     * 
     * @returns - any WebSocket Connection index value. This is the value that will be used to reference this connection.
     *
     *  
     */
    public onSocketConnected?(connection: SocketStream, request: FastifyRequest): any

    /**
     * onSocketDisconnected Hook is called when a websocket connection is closed
     * 
     * @param code - The websocket close code
     * @param reason - The websocket close reason
     * @param connection - The SocketStream
     * @param key - The key value returned by the onSocketConnected hook
     * 
     * @returns - void
     */
    public onSocketDisconnected?(connection: SocketStream, key: any, code: number, reason: string ): void

    /**
     * onSocketMessageReceived Hook is called when a websocket message is received
     * 
     * @param message - The message received 
     *   
     */
    public onSocketMessageReceived?(message: any, key: any): void

    /**
     * onSocketMessageReceivedError Hook is called when an error occurs on websocket message received
     * 
     * @param message 
     * @param key 
     * @param error 
     */
    public onSocketMessageReceivedError(message: any, key: any, error: any): void {
        console.error('onSocketMessageReceivedError: ', error)
    }

    /**
     * onSocketMessageSendError Hook is called when an error occurs on websocket message send
     * 
     * @param message 
     * @param key 
     * @param error 
     */
    public onSocketMessageSendError(message: any, key: any, error: any): any {

        console.error('onSocketMessageSendError: ', error)
        return error
    }

    /**
     * socketSendMessage method sends a message to a websocket connection defined by the key parameter
     * 
     * @param key - The key value returned by the onSocketConnected hook
     * @param message - The message to send
     * 
     * @returns - boolean
     */
    public socketSendMessage(message: any, key: any): boolean {

        if (this.sockets !== null && this.sockets.has(key)) {

            let mess: string = message

            if (this.schema?.socket?.out && this.socketSchemaValidatorOut !== undefined) {

                const result = this.socketSchemaValidatorOut(mess)

                if (!result) {

                    const errors = this.socketSchemaValidatorOut.errors
                    console.log('socketSendMessage: errors: ', errors)

                    const error = {
                        error: {
                            message: errors?.at(0)?.message || 'Invalid socket message'
                        }
                    }

                    console.error('socketSendMessage: error: ', error)
                    mess = this.onSocketMessageSendError(message, key, error)
                }
            }

            if (typeof mess === 'object') {

                mess = JSON.stringify(mess)
            }

            this.sockets.get(key)?.socket.send(mess)

            return true
        }

        return false
    }

    /**
     * socketBroadcastMessage method broadcasts a message to all websocket connections
     * 
     * @param message - The message to send
     * 
     * @returns - boolean
     */
    public socketBroadcastMessage(message: any): boolean {

        if (this.sockets !== null) {

            this.sockets.forEach(socket => {
                socket.socket.send(message)
            })

            return true
        }

        return false
    }

    /**
     * socketCloseConnection method closes a websocket connection defined by the key parameter
     * 
     * @param key - The key value returned by the onSocketConnected hook
     * 
     * @returns - boolean
     */
    public socketCloseConnection(key: any): boolean {

        if (this.sockets !== null && this.sockets.has(key)) {

            this.sockets.get(key)?.socket.close()
            return this.sockets.delete(key)
        }

        return false
    }
}

