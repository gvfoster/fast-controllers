import type { FastifyRequest, FastifyReply } from 'fastify'

import { JwtPayload, verify } from 'jsonwebtoken'

import { SecureFastController } from '../../../src'
import { FastControllerException } from '../../../src/exceptions'


class JwtAuthController extends SecureFastController {

    private tokenKey = 'testkey'
    protected userSub?: string

    public override onPreValidation(_request: FastifyRequest, _reply: FastifyReply, done: (err?: Error) => void): void | Promise<unknown> | string {

        try{

            if(!_request.headers.authorization) {
                throw new FastControllerException('Authorization Headers Not Provided')
            }

            let authHeader = _request.headers.authorization
            authHeader = authHeader.substring( authHeader.indexOf('Bearer ') + 7 )

            if( authHeader.length < 20 ) {
                throw new FastControllerException('Authorization Header Not Valid')
            } 

            verify(authHeader, this.tokenKey, (err, payload) => {

                if(err) {
                    throw new FastControllerException(err.message)
                }

                this.userSub = (payload as JwtPayload).sub!
            }) 
        }
        
        catch( error ) {

            if( error instanceof FastControllerException) {
                _reply
                    .status(401)
                    .send({error: error.message})
            } 
        }

        finally { done() }
    }
}

export default JwtAuthController