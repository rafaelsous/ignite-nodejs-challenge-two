import fastify from 'fastify'

import { mealsRoutes, usersRoutes } from './routes'

export const app = fastify()

app.register(usersRoutes, {
  prefix: 'users',
})

app.register(mealsRoutes, {
  prefix: 'meals',
})
