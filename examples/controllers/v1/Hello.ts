import { FastController } from "../../../src"

export default class Hello extends FastController {

    public override schema = {
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
}