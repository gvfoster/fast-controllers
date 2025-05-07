

import { FastifyRequest } from "fastify"
import { FastController } from "../../../../src"

/**
 * Demonstrates how to use an index controller with optional params.
 * 
 * This can be used as a catchall.
 */
export default class Utils extends FastController {

    public override schema = {
        params: {
            get: {
                type: 'object',
                properties: {
                    param1: { type: 'string' }
                }
            }
        }
    }

    public override params = {
        get: ['param1']   
    }


    public override get(request: FastifyRequest<{Params: {param1: string}}>) {
        return ` very useful data: ${request.params.param1} `
    }
}