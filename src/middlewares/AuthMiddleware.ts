import { FastifyReply, FastifyRequest } from 'fastify'

export const AuthMiddleware = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    await req.jwtVerify()
  } catch (err) {
    reply.code(401).send('Invalid token')
  }
}
