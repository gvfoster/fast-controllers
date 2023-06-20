import fastify, { FastifyRequest } from 'fastify'

import fastControllers from '../src/fastControllers'

import FastControllerError_InvalidControllerPath from '../src/errors/FastControllerError_InvalidControllerPath'
import fastifyWebsocket, { SocketStream } from '@fastify/websocket'

fastify({ logger: true })

    .register(fastifyWebsocket, {})

    //.register(fastControllers, {path: `${__dirname}/controllers`})

    .register(async function (instance, opts, done) {


        // instance.route({

        //     method: 'GET',
        //     url: '/testsocket',
        //     websocket: true,

        //     handler: (connection: SocketStream, request: FastifyRequest) => {
            
        //         console.log('socket connected', connection.socket.OPEN)
        //         connection.socket.on('message', message => {
                
        //             // message.toString() === 'hi from client'
        //             connection.socket.send('hi from server')
        //         })
        //     }
        // })
        instance
        .route({ 
            method: ['GET'],
            url: '/testsocket',
            websocket: true, 
            handler: (conn: any, req: any) => {

                conn.socket.on('message', (message: string) => {
                
                // message.toString() === 'hi from client'
                conn.socket.send('hi from servgcdfdfhver')
            })

        } }) //, (connection: SocketStream, request: FastifyRequest) => {
    
        //     console.log('socket connected', connection.socket.OPEN)
        //     connection.socket.on('message', message => {
            
        //         // message.toString() === 'hi from client'
        //         connection.socket.send('hi from server')
        //     })
        // })

        // done()
    })
    
    .listen({host: '0.0.0.0', port:3001}, ( error, address ) => {
                
        if (error) {
            
            console.log(error)
            process.exit(1)
        }

        console.log(`listening on ${address}`)
    })
    
