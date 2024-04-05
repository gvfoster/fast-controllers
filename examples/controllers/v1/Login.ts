import type { FastifyReply, FastifyRequest } from 'fastify'

import { JwtPayload, sign } from 'jsonwebtoken'

import FastController from '../../../src/FastController'

const tokenKey = 'testkey'
const tokenExpiration = '2h'

export default class Login extends FastController {

    override post(_request: FastifyRequest<{ Body: {email:string, password:string} }>, _reply: FastifyReply) {

        const payload: JwtPayload = { sub: 'ausersid' }
        const token = sign(payload, tokenKey, { expiresIn: tokenExpiration })

        return {
            accessToken: token,
        }
    }
}