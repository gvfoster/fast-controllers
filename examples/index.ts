import fastify from 'fastify'

import fastifyWebsocket from '@fastify/websocket'

import fastControllers from '../src/fastControllers'

fastify({ logger: true })

    .register(fastifyWebsocket, {})
    .register(fastControllers, {path: `${__dirname}/controllers`})
    .listen({host: '0.0.0.0', port:3001}, ( _, address ) => {
        
        console.log(`listening on ${address}`)
    })
    
