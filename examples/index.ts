import path from 'node:path'

import fastify from 'fastify'

import { fastControllers } from '../src'


fastify({ logger: true })

    .register(fastControllers, {path: path.resolve('./controllers')})

    .listen({host: '0.0.0.0', port:3001}, ( _, address ) => {
        console.log(`listening on ${address}`)
    })
    
