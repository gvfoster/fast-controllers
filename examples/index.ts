import fastify from 'fastify'

import fastControllers from '../src/fastControllers'

import FastControllerError_InvalidControllerPath from '../src/errors/FastControllerError_InvalidControllerPath'





fastify({ logger: true })

    .register(fastControllers, {path: `${__dirname}/controllers`})

    .listen({host: '0.0.0.0', port:3001}, ( _, address ) => {
        console.log(`listening on ${address}`)

        throw new FastControllerError_InvalidControllerPath('test')
    })
    
