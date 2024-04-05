import { FastifyReply, FastifyRequest } from 'fastify'
import { FastController } from "../../../src"

export default class Hello extends FastController {

    public override schema = {

        body: {

            put: {
                type: 'object',
                required: ['hi'],
                properties: {
                    hi: { type: 'string' }
                }
            },
            post: {

                type: 'object',
                properties: {
                    hello: { type: 'string' }
                }
            }
        },

        querystring: {

            get: {
                
                type: 'object',
                properties: {
                    hello: { type: 'string' }
                }
            }
        },

        response: {

            get: {
                200: {
                    type: 'object',
                    required: ['hi', 'hey'],
                    properties: {
                        hi: { type: 'string' },
                        hey: { type: 'string' }
                    }
                }
            },

            // Use the same schema for all of the remaining methods
            // only works for status code keyed response schemas
            200: {

                type: 'object',
                required: ['Hello', 'Welcome'],
                properties: {
                    Hello: { type: 'string' },
                    Welcome: { type: 'string' }
                }
            } 
        },

        params: {

            get: {
                type: 'object',
                properties: {

                    name: { type: 'string' }
                }
            }
        }
    } 

    public override params = {
        post: '/:first/:last',
        put: ['test1', 'test2'],
        get: ['param1']    
    }

    public override get(request: FastifyRequest<{Querystring: {hello: string }, Params: { 'param1': string } }>, _reply: FastifyReply) {

        const param1 = request.params.param1
        const { hello } = request.query

        return { hi: `${param1}`, hey: `${hello}` }
    }

    public override put (request: FastifyRequest<{Body: { hi: string }, Params: { test1: string, test2: string }}>, _reply: FastifyReply) {
        
        const { hi } = request.body

        return { Hello: hi, Welcome: 'there' }
    }

    public override post (request: FastifyRequest<{Params: {first:string, last:string}, Body:{ hello: string } }>, _reply: FastifyReply) {

        const { first, last } = request.params

        return { Hello: `${first} ${last}`, Welcome: request.body.hello }
    }
}