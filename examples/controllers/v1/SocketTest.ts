import { FastifyRequest, FastifySchema } from 'fastify'
import { SocketStream } from '@fastify/websocket'

import SimpleSecure from '../.auth/SimpleSecure'


export default class SocketTest extends SimpleSecure {

    public override schema = {
        
        socket: {
            in: {
                type: 'object',
                required: ['hello'],
                properties: {
                    hello: { type: 'string' }
                }
            },    
            out: {
                type: 'object',
                required: ['hi', 'hey'],
                properties: {
                    hi: { type: 'string' },
                    hey: { type: 'string' }
                }
            }
        }
    }

    public override onSocketConnected( connection: SocketStream, request: FastifyRequest ): any {
        
        console.log( 'socket connected, using key: ', request.id )
        return request.id
    }


    // public onSocketConnected(connection: SocketStream, request: FastifyRequest) {
    
    //     console.log( 'socket connected, using key: ', request.id )
    //     return request.id
    // }

    public override onSocketDisconnected( key: any ) {
    
        console.log( 'socket disconnected, using key: ', key )
    }


    public override onSocketMessageReceived( message: number, key: any ) {
    
        console.log( 'onSocketMessageReceived: ', message )
 
        this.socketSendMessage({ hi: 'hi from server', hey: 'hey from server' }, key )
    }

    public override onSocketMessageReceivedError( message: any, key: any, error: any ) {
    
        console.log( 'onSocketMessageReceivedError: ', message, error )

        this.socketSendMessage(error, key )
    }

    public override onSocketMessageSendError( message: any, key: any, error: any ) {
            
        console.log( 'onSocketMessageSendError: ', message, error )
        return error
    }
}