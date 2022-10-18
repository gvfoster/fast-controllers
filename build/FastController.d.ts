import type { FastifyInstance, FastifyReply, FastifyRequest, FastifySchema } from 'fastify';
/**
 *
 * class FastController is the base class for all controllers
 * implementing the `fastController` plugin
 */
declare class FastController {
    /**
     * Defines the shared scope for all derived controller classes
     */
    static scope: string;
    /**
     * The Fastify instance provided to the constructor
     */
    private _instance;
    /**
     * The relative path that this controller will handle
     */
    url: string;
    /**
     * The FastifySchema
     */
    schema: FastifySchema;
    /**
     * The http methods that this controller will respond to
     */
    method: Array<string>;
    constructor(i: FastifyInstance, route: string);
    set instance(i: FastifyInstance);
    get instance(): FastifyInstance;
    handler: (request: FastifyRequest, reply: FastifyReply) => void | Promise<unknown> | string | object;
    preValidation: (request: FastifyRequest, reply: FastifyReply, done: (err?: Error) => void) => void | Promise<unknown> | string;
    onPreValidation?(request: FastifyRequest, reply: FastifyReply, done: (err?: Error) => void): void | Promise<unknown> | string;
    get?(request: FastifyRequest, reply: FastifyReply): void | Promise<unknown> | string | object;
    head?(request: FastifyRequest, reply: FastifyReply): void | Promise<unknown> | string;
    patch?(request: FastifyRequest, reply: FastifyReply): void | Promise<unknown> | string;
    post?(request: FastifyRequest, reply: FastifyReply): void | Promise<unknown> | string;
    put?(request: FastifyRequest, reply: FastifyReply): void | Promise<unknown> | string;
    options?(request: FastifyRequest, reply: FastifyReply): void | Promise<unknown> | string;
    search?(request: FastifyRequest, reply: FastifyReply): void | Promise<unknown> | string;
    trace?(request: FastifyRequest, reply: FastifyReply): void | Promise<unknown> | string;
    propfind?(request: FastifyRequest, reply: FastifyReply): void | Promise<unknown> | string;
    proppatch?(request: FastifyRequest, reply: FastifyReply): void | Promise<unknown> | string;
    mkcol?(request: FastifyRequest, reply: FastifyReply): void | Promise<unknown> | string;
    copy?(request: FastifyRequest, reply: FastifyReply): void | Promise<unknown> | string;
    move?(request: FastifyRequest, reply: FastifyReply): void | Promise<unknown> | string;
    lock?(request: FastifyRequest, reply: FastifyReply): void | Promise<unknown> | string;
    unlock?(request: FastifyRequest, reply: FastifyReply): void | Promise<unknown> | string;
    handle?(request: FastifyRequest, reply: FastifyReply): void | Promise<unknown> | string | object;
}
export default FastController;
