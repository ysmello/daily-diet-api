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

    if (user) {
      return reply.status(400).send({
        erro: 'Email already exist',
      })
    }

    await knex('users').insert({
      id: randomUUID(),
      name,
      email,
      password,
    })

    return reply.status(201).send()
  })

  app.get('/', async (request, reply) => {
    const users = await knex('users').select()

    return { users }
  })
}
