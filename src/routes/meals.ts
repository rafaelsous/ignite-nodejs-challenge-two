import { FastifyInstance } from 'fastify'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'

import dayjs from 'dayjs'
import { knex } from '../database'
import { checkSessionExists } from '../middlewares/check-session-exists'

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
          isOnDiet: !!meal.is_on_diet,
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

  app.get(
    '/:id',
    {
      preHandler: [checkSessionExists],
    },
    async (request, reply) => {
      const findMealByIdParamSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = findMealByIdParamSchema.parse(request.params)

      const meal = await knex('meals')
        .where({
          id,
          user_id: request.user?.id,
        })
        .first()

      if (!meal) {
        return reply.status(404).send({ message: 'Resource not found' })
      }

      const dateWithoutHours = new Date(meal.date).toISOString().split('T')[0]
      const transformedMeal = {
        name: meal.name,
        description: meal.description,
        isOnDiet: !!meal.is_on_diet,
        date: dateWithoutHours,
        createdAt: meal.created_at,
        updatedAt: meal.updated_at,
      }

      return reply.status(200).send(transformedMeal)
    },
  )

  app.put(
    '/:id',
    {
      preHandler: [checkSessionExists],
    },
    async (request, reply) => {
      const findMealByIdParamSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = findMealByIdParamSchema.parse(request.params)

      const updateMealSchema = z.object({
        name: z.string(),
        description: z.string(),
        date: z.coerce.date(),
        isOnDiet: z.boolean(),
      })

      const { name, description, date, isOnDiet } = updateMealSchema.parse(
        request.body,
      )

      const meal = await knex('meals').where({ id }).first()

      if (!meal) {
        return reply.status(404).send({ message: 'Resource not found' })
      }

      const updatedAt = dayjs(new Date(), 'en-US').format('YYYY-MM-DD HH:mm:ss')

      await knex('meals').where({ id }).update({
        name,
        description,
        date: date.getTime(),
        is_on_diet: isOnDiet,
        updated_at: updatedAt,
      })

      return reply.status(200).send()
    },
  )

  app.delete(
    '/:id',
    {
      preHandler: [checkSessionExists],
    },
    async (request, reply) => {
      const findMealByIdParamSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = findMealByIdParamSchema.parse(request.params)

      const meal = await knex('meals').where({ id }).first()

      if (!meal) {
        return reply.status(404).send({ message: 'Resource not found' })
      }

      await knex('meals').where({ id }).del()

      return reply.status(204).send()
    },
  )
}
