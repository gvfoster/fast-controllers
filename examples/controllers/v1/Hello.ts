import { FastController } from "../../../src"

export default class Hello extends FastController {

    public override schema = {

        body: {

            //put: {
            //    type: 'object',
            //    required: ['hello'],
            //    properties: {
            //        hello: { type: 'string' }
            //    }
            //},

            //post: {

                type: 'object',
                properties: {
                    hello: { type: 'string' }
                }
            //}
        },

        querystring: {
            type: 'object',
            required: ['hello'],
            properties: {
                hello: { type: 'string' }
            }
        },

        response: {

            get: {
                200: {
                    type: 'object',
                    required: ['hithere', 'hey'],
                    properties: {
                        hithere: { type: 'string' },
                        hey: { type: 'string' }
                    }
                }
            },

            200: {
                type: 'object',
                required: ['hi', 'hey'],
                properties: {
                    hi: { type: 'string' },
                    hey: { type: 'string' }
                }
            } 
        }
    } 

    public override get() {
        return { hi: 'there', hey: 'yo' }
    }

    public override put () {
        
        return { hi: 'there', hey: 'yo' }
    }

    public override post () {
            
        return { hi: 'there', hey: 'yo' }
    }
}