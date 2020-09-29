import { Arg, Ctx, ID, Mutation, Publisher, PubSub, Resolver, ResolverFilterData, Root, Subscription } from 'type-graphql'
import { pool } from '../../db'
import Vote, { VoteOptions } from '../../db/entities/vote'

@Resolver(Vote)
export default class VoteResolver {
  private pool = pool

  @Mutation(type => Vote)
  async castVote(
    @Arg('questionId', type => ID) questionId: number,
    @Arg('vote', type => VoteOptions) vote: VoteOptions,
    @Ctx() { voter }: { voter: any }, // TODO: use context type
    @PubSub('VOTES') publisher: Publisher<Vote>
  ): Promise<Vote> {
    const connection = await pool
    const voteRepo = connection.getRepository(Vote)

    const voteInstance = voteRepo.create({
      questionId,
      vote,
      voterId: voter.id
    })

    const savedVote = await voteRepo.save(voteInstance)

    await publisher(savedVote)
    return savedVote
  }

  @Subscription({
    topics: 'VOTES',
    // replace questionId with sessionId
    filter: ({ payload, args }: ResolverFilterData<Vote>) => payload.questionId === args.questionId
  })
  voteSubscription(@Arg('questionId') questionId: number, @Root() vote: Vote): Vote {
    return vote
  }
}
