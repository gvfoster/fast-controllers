import { FastifyReply, FastifyRequest } from 'fastify'
import SecureFastController from '../../../src/SecureFastController'
import FastControllerError from '../../../src/errors/FastControllerError'

export default class SimpleSecure extends SecureFastController {

    public override onPreValidation(request: FastifyRequest, reply: FastifyReply, done: (err?:Error)=>void) {
    
        console.log('authorization header found', request.headers.authorization)
        if(request.headers.authorization !== 'Bearer 1234567890') {

            done(new FastControllerError('Authorization Header Not Valid', 401))
        }

        done()
    }
}