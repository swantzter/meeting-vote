import { Arg, Authorized, Ctx, ID, Mutation, Publisher, PubSub, Resolver, ResolverFilterData, Root, Subscription } from 'type-graphql'
import { AuthLevels, VoteOptions } from '../../helpers/enums'
import { pool } from '../../db'
import Vote from '../../db/entities/vote'
import { Context } from '..'
import { ApolloError } from 'apollo-server'
import Question from '../../db/entities/question'

@Resolver(Vote)
export default class VoteResolver {
  private pool = pool

  @Authorized(AuthLevels.VOTER)
  @Mutation(type => Vote)
  async castVote (
    @Arg('questionId', type => ID) questionId: number,
    @Arg('vote', type => VoteOptions) vote: VoteOptions,
    @Ctx() { voter, sessionId }: Context,
    @PubSub('votes') publisher: Publisher<Vote>
  ): Promise<Vote> {
    if (!voter) throw new ApolloError('No voter provided')

    const connection = await this.pool
    const voteRepo = connection.getRepository(Vote)
    const questionRepo = connection.getRepository(Question)

    const questionInstance = await questionRepo.findOneOrFail({ where: { id: questionId, sessionId } })
    if (!questionInstance.openedAt || questionInstance.closedAt) throw new ApolloError('Vote is not open')

    const voteInstance = voteRepo.create({
      questionId,
      vote,
      voterId: voter.id
    })

    const savedVote = await voteRepo.save(voteInstance)

    await publisher(savedVote)
    return savedVote
  }

  @Authorized(AuthLevels.ADMIN, AuthLevels.VOTER, AuthLevels.AUDIENCE)
  @Subscription({
    topics: 'votes',
    // replace questionId with sessionId
    filter: ({ payload, args }: ResolverFilterData<Vote>) => payload.questionId === args.questionId
  })
  voteSubscription (@Arg('questionId', type => ID) questionId: number, @Root() vote: Vote): Vote {
    return vote
  }
}
