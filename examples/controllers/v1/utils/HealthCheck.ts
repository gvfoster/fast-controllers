import FastController from "../../../../src/FastController"

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

        // This will return nothing due to json schema defined above 
        // delete the schema override to see result
        return { hi: 'there', hey: 'hee' }
    }
}