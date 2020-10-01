import { Arg, Authorized, Ctx, ID, Mutation, Resolver } from 'type-graphql'
import { Context } from '..'
import { pool } from '../../db'
import Voter from '../../db/entities/voter'
import { AuthLevels } from '../../helpers/enums'
import bcrypt from 'bcrypt'
import Question from '../../db/entities/question'
import { ApolloError } from 'apollo-server'

@Resolver(Voter)
export default class VoterResolver {
  private pool = pool

  @Authorized(AuthLevels.ADMIN)
  @Mutation(returns => Voter)
  async createVoter (
    @Ctx() { sessionId }: Context,
    @Arg('voterId', type => ID) voterId: string,
    @Arg('voterKey') voterKey: string
  ): Promise<Voter> {
    const connection = await pool
    const voterRepo = connection.getRepository(Voter)

    const voterInstance = voterRepo.create({
      id: voterId,
      key: await bcrypt.hash(voterKey, 10),
      sessionId
    })

    const savedVoter = voterRepo.save(voterInstance)

    return savedVoter
  }

  @Authorized(AuthLevels.ADMIN)
  @Mutation(returns => Voter)
  async removeVoter (
    @Ctx() { sessionId }: Context,
    @Arg('voterId', type => ID) voterId: string
  ): Promise<Voter> {
    const connection = await pool
    const voterRepo = connection.getRepository(Voter)

    const voterInstance = await voterRepo.findOne({ where: { id: voterId }, relations: ['votes'] })

    if (!voterInstance) throw new ApolloError('Voter not found')
    if (voterInstance.votes.length) throw new ApolloError('Cannot remove voter who has cast votes')

    voterRepo.remove(voterInstance)

    return voterInstance
  }

  @Authorized(AuthLevels.ADMIN)
  @Mutation(type => Voter)
  async blockVoter (
    @Ctx() { sessionId }: Context,
    @Arg('voterId', type => ID) voterId: string,
    @Arg('questionId', type => ID!) questionId: string
  ): Promise<Voter> {
    const connection = await pool
    const questionRepo = connection.getRepository(Question)
    const voterRepo = connection.getRepository(Voter)

    const questionInstance = await questionRepo.findOne({ where: { id: questionId, sessionId } })
    if (!questionInstance) throw new ApolloError('Question not found in session')
    if (questionInstance.openedAt) throw new ApolloError('Cannot block a voter after the vote has opened')

    await questionRepo.createQueryBuilder()
      .relation('blockedVoters')
      .of(questionId)
      .add(await voterRepo.findOne({ where: { id: voterId } }))

    return voterRepo.create({ id: voterId })
  }

  @Authorized(AuthLevels.ADMIN)
  @Mutation(type => Voter)
  async unblockVoter (
    @Ctx() { sessionId }: Context,
    @Arg('voterId', type => ID) voterId: string,
    @Arg('questionId', type => ID!) questionId: string
  ): Promise<Voter> {
    const connection = await pool
    const questionRepo = connection.getRepository(Question)
    const voterRepo = connection.getRepository(Voter)

    const questionInstance = await questionRepo.findOne({ where: { id: questionId, sessionId } })
    if (!questionInstance) throw new ApolloError('Question not found in session')
    if (questionInstance.openedAt) throw new ApolloError('Cannot unblock a voter after the vote has opened')

    await questionRepo.createQueryBuilder()
      .relation('blockedVoters')
      .of(questionId)
      .remove(await voterRepo.findOne({ where: { id: voterId } }))

    return voterRepo.create({ id: voterId })
  }
}
