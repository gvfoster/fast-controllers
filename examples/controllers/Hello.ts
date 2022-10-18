import { FastController } from "../../src"

export default class Hello extends FastController {

    schema = {
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

    public get() {
        return { hi: 'there', hey: 'yo' }
    }
}