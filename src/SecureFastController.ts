
import type { FastifyReply, FastifyRequest } from 'fastify'
import FastController from './FastController'


class SecureFastController extends FastController {

    static override scope = 'secured'

    public override onPreValidation(_request: FastifyRequest, _reply: FastifyReply, done: (err?:Error) => void) {
        
        console.log('preValidation')
        done()
    }
}

export default SecureFastController