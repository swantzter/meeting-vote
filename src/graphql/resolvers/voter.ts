import { Arg, Authorized, Ctx, ID, Mutation, Resolver } from 'type-graphql'
import { Context } from '..'
import { pool } from '../../db'
import Voter from '../../db/entities/voter'
import { AuthLevels } from '../../helpers/enums'
import bcrypt from 'bcrypt'

@Resolver(Voter)
export default class VoterResolver {
  private pool = pool

  @Authorized(AuthLevels.ADMIN)
  @Mutation(returns => Voter)
  async createVoter (
    @Ctx() { sessionId }: Context,
    @Arg('id', type => ID) id: string,
    @Arg('key') key: string
  ): Promise<Voter> {
    const connection = await pool
    const voterRepo = connection.getRepository(Voter)

    // TODO: prevent if blocked

    const voterInstance = voterRepo.create({
      id,
      key: await bcrypt.hash(key, 10),
      sessionId
    })

    const savedVoter = voterRepo.save(voterInstance)

    return savedVoter
  }

  @Authorized(AuthLevels.ADMIN)
  @Mutation()
  async blockVoter(
    @Ctx() { sessionId }: Context,
    @Arg('voterId', type => ID) voterId: string,
    @Arg('questionId', type => ID!) questionId: string
  )
}
