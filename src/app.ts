import fastify from 'fastify'
import fastifyCookie from '@fastify/cookie'

import { usersRoutes } from './routes/users'
import { dietsRoutes } from './routes/diets'

export const app = fastify()

app.register(fastifyCookie)

app.register(usersRoutes, {
  prefix: '/users',
})
app.register(dietsRoutes, {
  prefix: '/diets',
})
