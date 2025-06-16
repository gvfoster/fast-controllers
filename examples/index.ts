import Fastify from 'fastify'

import fastControllers from '../src/fastControllers'

const server = Fastify({ logger: true })

server
    .register(fastControllers, {path: `${__dirname}/controllers`})
    .listen({host: '0.0.0.0', port:3001}, ( err, address ) => {
        
        if(err) {

            console.error(err)
            process.exit(1)
        }

        console.log(`listening on ${address}`)
    })
