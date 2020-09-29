import { buildSchemaSync as buildSchema, AuthChecker } from 'type-graphql'
import QuestionResolver from './resolvers/question'
import SessionResolver from './resolvers/session'
import VoteResolver from './resolvers/vote'
import { GooglePubSub } from '@axelspringer/graphql-google-pubsub'
import dateParser from '../helpers/json-date'
import { AuthLevels } from '../helpers/enums'
import auth from 'basic-auth'
import { AuthenticationError } from 'apollo-server'
import { pool } from '../db'
import Voter from '../db/entities/voter'
import Session from '../db/entities/session'
import bcrypt from 'bcrypt'
import VoterResolver from './resolvers/voter'

export interface Context {
  voter?: Voter
  sessionId?: string
  role?: AuthLevels
}

const authChecker: AuthChecker<Context, AuthLevels> = async ({ context }, roles) => {
  if (roles.includes(AuthLevels.ADMIN)) {
    return context.role === AuthLevels.ADMIN
  } else if (roles.includes(AuthLevels.VOTER)) {
    return context.role === AuthLevels.VOTER
  } else if (roles.includes(AuthLevels.AUDIENCE)) {
    return context.role === AuthLevels.AUDIENCE
  }
  return false
}

export const schema = buildSchema({
  resolvers: [QuestionResolver, SessionResolver, VoteResolver, VoterResolver],
  dateScalarMode: 'timestamp',
  authChecker,
  pubSub: new GooglePubSub(
    undefined,
    topicName => `${topicName}-subscription`,
    ({ data }) => JSON.parse(data.toString(), dateParser)
  )
})

export async function context (context: any): Promise<Context> {
  // TODO fix for subscriptions, also maybe make less of a mess?
  context.sessionId = context.req.get('session-id')
  context.audience = false
  context.voter = false
  context.admin = false
  const authMode = context.req.get('auth-mode')

  if (authMode === AuthLevels.ADMIN) {
    if (!context.sessionId) throw new AuthenticationError('No session id provided to auth to')
    const creds = auth(context.req)
    if (!creds) throw new AuthenticationError('No Basic auth provided')

    const connection = await pool
    const sessionRepo = connection.getRepository(Session)

    const session = await sessionRepo.findOne({ where: { id: context.sessionId }, select: ['adminPassword'] })
    if (!session) throw new AuthenticationError('Session not found')

    const passwordMatch = await bcrypt.compare(creds.pass, session.adminPassword)
    if (!passwordMatch) throw new AuthenticationError('Incorrect Password')

    context.role = AuthLevels.ADMIN
  } else if (authMode === AuthLevels.VOTER) {
    if (!context.sessionId) throw new AuthenticationError('No session id provided to auth to')
    const creds = auth(context.req)
    if (!creds) throw new AuthenticationError('No Basic auth provided')

    const connection = await pool
    const voterRepo = connection.getRepository(Voter)

    context.voter = await voterRepo.findOne({ where: { id: creds.name, sessionId: context.sessionId } })
    if (!context.voter) throw new AuthenticationError('No session id provided to auth to')

    const passwordMatch = await bcrypt.compare(creds.pass, context.voter.key)
    if (!passwordMatch) throw new AuthenticationError('Incorrect Password')

    context.role = AuthLevels.VOTER
  } else if (authMode === AuthLevels.AUDIENCE) {
    if (!context.sessionId) throw new AuthenticationError('No session id provided to auth to')
    const connection = await pool
    const sessionRepo = connection.getRepository(Session)

    const session = await sessionRepo.findOne({ where: { id: context.sessionId }, select: ['audiencePassword'] })
    if (!session) throw new AuthenticationError('Session not found')

    if (session.audiencePassword) {
      const creds = auth(context.req)
      if (!creds) throw new AuthenticationError('No Basic auth provided')

      const passwordMatch = await bcrypt.compare(creds.pass, session.audiencePassword)
      if (!passwordMatch) throw new AuthenticationError('Incorrect Password')
    }

    context.role = AuthLevels.AUDIENCE
  }

  return context
}
