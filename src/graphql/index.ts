import { buildSchemaSync as buildSchema } from 'type-graphql'
import { Connection } from 'typeorm'
import QuestionResolver from './resolvers/question'
import SessionResolver from './resolvers/session'
import VoteResolver from './resolvers/vote'

export interface Context {
  pool: Promise<Connection>
}

async function authChecker () {
  // TODO: implement
  return true
}

export const schema = buildSchema({
  resolvers: [QuestionResolver, SessionResolver, VoteResolver],
  dateScalarMode: 'timestamp',
  authChecker
})

export async function context (context: any): Promise<Context> {
  // session id in context?
  // voter or user in context
  return {
    ...context
  }
}
