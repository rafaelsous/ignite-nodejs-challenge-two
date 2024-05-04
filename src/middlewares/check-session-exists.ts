import { FastifyReply, FastifyRequest } from 'fastify'
import { knex } from '../database'

export async function checkSessionExists(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const sessionId = request.cookies.sessionId

  if (!sessionId) {
    return reply.status(401).send({ message: 'Unauthorized' })
  }

  const user = await knex('users')
    .where({
      session_id: sessionId,
    })
    .first()

  if (!user) {
    return reply.status(401).send({ message: 'Unauthorized' })
  }

  request.user = user
}
