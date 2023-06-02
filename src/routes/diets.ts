import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'crypto'
import { knex } from '../database'

import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

export async function dietsRoutes(app: FastifyInstance) {
  app.addHook('onRequest', checkSessionIdExists)

  app.get('/', async (request, reply) => {
    const { sessionId } = request.cookies
    const diets = await knex('diets').select().where('user_id', sessionId)

    return { diets }
  })

  app.get('/:id', async (request, reply) => {
    const getDietParams = z.object({
      id: z.string().uuid(),
    })

    const { sessionId } = request.cookies
    const { id } = getDietParams.parse(request.params)

    const diet = await knex('diets')
      .select()
      .where({
        id,
        user_id: sessionId,
      })
      .first()

    return { diet }
  })

  app.get('/metrics', async (request, reply) => {
    const { sessionId } = request.cookies

    const diets = await knex('diets').select().where('user_id', sessionId)

    let bestSequence = 0
    let actualSequence = 0
    diets.forEach((diet) => {
      if (diet.compliant) actualSequence++
      if (!diet.compliant && bestSequence < actualSequence) {
        bestSequence = actualSequence
        actualSequence = 0
      }
    })

    const metrics = {
      totalMeals: diets.length,
      totalCompliants: diets.reduce(
        (sum, diet) => (diet.compliant ? sum + 1 : sum),
        0,
      ),
      totalNoCompliants: diets.reduce(
        (sum, diet) => (!diet.compliant ? sum + 1 : sum),
        0,
      ),
      bestSequence,
    }

    return { metrics }
  })

  app.post('/', async (request, reply) => {
    const createDietBodySchema = z.object({
      name: z.string(),
      description: z.string(),
    })

    const { sessionId } = request.cookies
    const { name, description } = createDietBodySchema.parse(request.body)

    await knex('diets').insert({
      id: randomUUID(),
      name,
      description,
      compliant: false,
      user_id: sessionId,
    })

    return reply.status(201).send()
  })

  app.put('/:id', async (request, reply) => {
    const updateDietParams = z.object({
      id: z.string().uuid(),
    })
    const updateDietBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      compliant: z.boolean(),
      data: z.string(),
    })

    const { sessionId } = request.cookies
    const { id } = updateDietParams.parse(request.params)
    const { name, description, compliant, data } = updateDietBodySchema.parse(
      request.body,
    )

    const diet = knex('diets')
      .select()
      .where({
        id,
        user_id: sessionId,
      })
      .first()

    if (!diet) {
      reply.status(400).send({ error: 'Diet not exists' })
    }

    await knex('diets')
      .update({
        name,
        description,
        compliant,
        created_at: data,
      })
      .where('id', id)

    return reply.status(201).send()
  })

  app.delete('/:id', async (request, reply) => {
    const deleteDietParams = z.object({
      id: z.string().uuid(),
    })

    const { sessionId } = request.cookies
    const { id } = deleteDietParams.parse(request.params)

    const diet = knex('diets')
      .select()
      .where({
        id,
        user_id: sessionId,
      })
      .first()

    if (!diet) {
      reply.status(400).send({ error: 'Diet not exists' })
    }

    await knex('diets').delete().where('id', id)

    return reply.status(201).send()
  })
}
