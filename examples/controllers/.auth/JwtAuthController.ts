import type { FastifyRequest, FastifyReply } from 'fastify'

import { JwtPayload, verify } from 'jsonwebtoken'

import SecureFastController from '../../../src/SecureFastController'
import FastControllerError from '../../../src/errors/FastControllerError'


class JwtAuthController extends SecureFastController {

    private tokenKey = 'testkey'
    protected userSub?: string

    public override onPreValidation(request: FastifyRequest, reply: FastifyReply, done: (err?:Error)=>void) {

        try{

            if(!request.headers.authorization) {
                throw new FastControllerError('Authorization Headers Not Provided')
            }

            let authHeader = request.headers.authorization
            authHeader = authHeader.substring( authHeader.indexOf('Bearer ') + 7 )
            console.log(`authHeader: ${authHeader}`)

            if( authHeader.length < 20 ) {
                throw new FastControllerError('Authorization Header Not Valid')
            } 

            verify(authHeader, this.tokenKey, (err, payload) => {

                console.log('decoded jwt token:')
                console.log(payload?.sub || 'payload not defined')
    
                if(err) {
                    throw new FastControllerError(err.message)
                }

                this.userSub = (payload as JwtPayload).sub!
            }) 
        }
        
        catch( error ) {

            if( error instanceof FastControllerError) {
                reply
                    .status(401)
                    .send({error: error.message})
            } 
        }

        finally { done() }
    }
}

export default JwtAuthController