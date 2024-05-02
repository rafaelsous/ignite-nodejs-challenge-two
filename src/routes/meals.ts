import { FastifyInstance } from 'fastify'
import { z } from 'zod'

export async function mealsRoutes(app: FastifyInstance) {
  app.post('/', (request) => {
    const createUserSchema = z.object({
      name: z.string(),
    })

    const { name } = createUserSchema.parse(request.body)

    return { message: `Welcome at Meals Routes, ${name}!` }
  })
}
