import { FastController } from "../../../src"

export default class Hello extends FastController {

    public override schema = {

        body: {

            type: 'object',
            properties: {
                hello: { type: 'string' }
            }
        },

        querystring: {
            type: 'object',
            properties: {
                hello: { type: 'string' }
            }
        },

        response: {
            200: {
                type: 'object',
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