import { randomUUID } from 'node:crypto'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { checkSessionExists } from '../middlewares/check-session-exists'
import { knex } from '../database'

export async function mealsRoutes(app: FastifyInstance) {
  app.post(
    '/',
    {
      preHandler: [checkSessionExists],
    },
    async (request, reply) => {
      const createMealSchema = z.object({
        name: z.string(),
        description: z.string(),
        date: z.coerce.date(),
        isOnDiet: z.boolean(),
      })

      const { name, description, date, isOnDiet } = createMealSchema.parse(
        request.body,
      )

      await knex('meals').insert({
        id: randomUUID(),
        name,
        description,
        date: date.getTime(),
        is_on_diet: isOnDiet,
        user_id: request.user?.id,
      })

      return reply.status(201).send()
    },
  )

  app.get(
    '/',
    {
      preHandler: [checkSessionExists],
    },
    async (request, reply) => {
      const meals = await knex('meals')
        .where({
          user_id: request.user?.id,
        })
        .orderBy('date', 'desc')

      const transformedMeals = meals.map((meal) => {
        const dateWithoutHours = new Date(meal.date).toISOString().split('T')[0]

        return {
          id: meal.id,
          name: meal.name,
          description: meal.description,
          isOnDiet: meal.is_on_diet,
          date: dateWithoutHours,
          createdAt: meal.created_at,
          updatedAt: meal.updated_at,
        }
      })

      return reply.status(200).send({
        meals: transformedMeals,
      })
    },
  )
}
