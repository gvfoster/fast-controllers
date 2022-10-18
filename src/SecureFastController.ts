
import type { FastifyReply, FastifyRequest } from 'fastify'
import FastController from './FastController'


class SecureFastController extends FastController {
    static override scope = 'secured'

    override onPreValidation(request: FastifyRequest, reply: FastifyReply, done: (err?:Error)=>void) {
        done()
    }
}

export default SecureFastController