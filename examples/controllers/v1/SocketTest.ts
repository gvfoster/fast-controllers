import { SocketStream } from '@fastify/websocket'
import { FastifyRequest } from 'fastify'
import SimpleSecure from '../.auth/SimpleSecure'

export default class SocketTest extends SimpleSecure {

    public override webSocketHandler(connection: SocketStream, request: FastifyRequest) {

        console.log('socket connected', connection.socket.OPEN)

        connection.socket.on('message', message => {
            
            // message.toString() === 'hi from client'
            connection.socket.send('hi from fastControllers dude!')
        })
    }
}