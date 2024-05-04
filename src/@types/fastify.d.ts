import 'fastify'

declare module 'fastify' {
  export interface FastifyRequest {
    user?: {
      id: string
      name: string
      email: string
      session_id: string
      created_at: string
      updated_at: string
    }
  }
}
