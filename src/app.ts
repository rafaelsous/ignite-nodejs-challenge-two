import fastify from 'fastify'
import cookie from '@fastify/cookie'

import { mealsRoutes, usersRoutes } from './routes'

export const app = fastify()

app.register(cookie)

app.register(usersRoutes, { prefix: 'users' })
app.register(mealsRoutes, { prefix: 'meals' })
