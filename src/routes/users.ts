import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'crypto'

import { knex } from '../database'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const createUserBodySchema = z.object({
      name: z.string(),
      email: z.string().email(),
      password: z.string(),
    })

    const { name, email, password } = createUserBodySchema.parse(request.body)

    const user = await knex('users').select().where('email', email).first()
    const uuid = randomUUID()

    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = uuid

      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      })
    }

    if (user) {
      return reply.status(400).send({
        erro: 'Email already exist',
      })
    }

    await knex('users').insert({
      id: uuid,
      name,
      email,
      password,
    })

    return reply.status(201).send()
  })

  // app.get('/metrics', async (request, reply) => {
  //   const { sessionId } = request.cookies

  //   const users = await knex('users').select().where('id', sessionId)

  //   return { users }
  // })
}
