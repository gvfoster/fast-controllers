import { FastifyRequest } from 'fastify'
import { FastController } from "../../../src"

export default class Hello extends FastController {

    public override schema = {

        body: {

            put: {
                type: 'object',
                required: ['hello'],
                properties: {
                    hello: { type: 'string' }
                }
            },
            post: {

                type: 'object',
                properties: {
                    hello: { type: 'string' }
                }
            }
        },

        // querystring: {
        //     type: 'object',
        //     properties: {
        //         hello: { type: 'string' }
        //     }
        // },

        response: {

            // get: {
            //     200: {
            //         type: 'object',
            //         required: ['hi', 'hey'],
            //         properties: {
            //             hi: { type: 'string' },
            //             hey: { type: 'string' }
            //         }
            //     }
            // },

            200: {
                type: 'object',
                required: ['hi', 'hey'],
                properties: {
                    hi: { type: 'string' },
                    hey: { type: 'string' }
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

    public override params = ['first', 'last']

    public override get(request: FastifyRequest<{Params: {first?: string, last?: string}, Querystring: {hello: string}}>) {

        const name = request.params.first + ' ' + request.params.last
        const hello = request.query.hello

        return { hi: `there ${name}` , hey: `yo ${hello}` }
    }

    public override put () {
        
        return { hi: 'there', hey: 'yo' }
    }

    public override post () {
            
        return { hi: 'there', hey: 'yo' }
    }
}