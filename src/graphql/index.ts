import { buildSchemaSync as buildSchema } from 'type-graphql'
import { Connection } from 'typeorm'
import { pool } from '../db'
import QuestionResolver from './resolvers/question'
import SessionResolver from './resolvers/session'

export interface Context {
  pool: Promise<Connection>
}

async function authChecker() {
  // TODO: implement
  return true
}

export const schema = buildSchema({
  resolvers: [QuestionResolver, SessionResolver],
  dateScalarMode: 'timestamp',
  authChecker
})

export async function context(context: any): Promise<Context> {
  return {
    ...context,
    pool
  }
}
