import { Arg, Authorized, Ctx, FieldResolver, ID, Mutation, Publisher, PubSub, Resolver, ResolverFilterData, Root, Subscription } from 'type-graphql'
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

    // TODO: don't load in ALL blocks to check if someone is bocked - that doesn't scale
    const questionInstance = await questionRepo.findOneOrFail({ where: { id: questionId, sessionId }, relations: ['blockedVoters'] })
    if (!questionInstance.openedAt || questionInstance.closedAt) throw new ApolloError('Vote is not open')
    if (questionInstance.blockedVoters.find(blockedVoter => voter.id === blockedVoter.id)) throw new ApolloError('You are not allowed to vote on this question')

    const voteInstance = voteRepo.create({
      questionId,
      vote,
      voterId: voter.id
    })

    const savedVote = await voteRepo.save(voteInstance)

    savedVote.sessionId = sessionId
    await publisher(savedVote)
    return savedVote
  }

  @FieldResolver(returns => Question)
  async question (@Ctx() { loaders }: Context, @Root() vote: Vote) {
    console.log('loading')
    console.log(await loaders.questionLoader.load(vote.questionId))
    return loaders.questionLoader.load(vote.questionId)
  }

  @Authorized(AuthLevels.ADMIN, AuthLevels.VOTER, AuthLevels.AUDIENCE)
  @Subscription(returns => Vote, {
    topics: 'votes',
    filter: ({ payload, context }: ResolverFilterData<Vote, any, Context>) => payload.sessionId === context.sessionId
  })
  voteSubscription (@Root() vote: Vote): Vote {
    return vote
  }
}
