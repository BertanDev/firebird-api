import fastify from 'fastify'
import cors from '@fastify/cors'

import { routes } from './routesManager'
import jwt from '@fastify/jwt'

const app = fastify()

app.register(cors, {})
app.register(routes)

app.register(jwt, {
  secret: process.env.JWT_SECRET as string,
})

// Para hospedagem aws
// const start = async () => {
//   try {
//     // const PORT = process.env.port || 8080;
//     await app.listen({ port: 8080, host: '0.0.0.0' }, () =>
//       console.log('SERVER LISTENING AT PORT : ' + '8080'),
//     )
//   } catch (err) {
//     app.log.error(err)
//     process.exit(1)
//   }
// }
// start()

// Para uso em dev
app.listen({ port: 8081 }, () => {
  console.log('SERVER LISTENING AT PORT 8081')
})

export { app }
