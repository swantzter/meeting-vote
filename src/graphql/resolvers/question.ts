import { Arg, Authorized, Ctx, FieldResolver, ID, Mutation, Publisher, PubSub, registerEnumType, Resolver, ResolverFilterData, Root, Subscription } from 'type-graphql'
import { pool } from '../../db'
import Session from '../../db/entities/session'
import Question from '../../db/entities/question'
import Vote from '../../db/entities/vote'
import { ApolloError } from 'apollo-server'
import { AuthLevels, Directions, VoteOptions } from '../../helpers/enums'
import { Context } from '..'
import Voter from '../../db/entities/voter'

registerEnumType(Directions, {
  name: 'Directions'
})

@Resolver(Question)
export default class QuestionResolver {
  private pool = pool

  @Authorized(AuthLevels.ADMIN)
  @Mutation(returns => Question)
  async createQuestion (
    @PubSub('questions') publish: Publisher<Question>,
    @Ctx() { sessionId }: Context,
    @Arg('question') question: string
  ): Promise<Question | undefined> {
    const connection = await this.pool
    const questionsRepo = connection.getRepository(Question)

    const maxOrder = await questionsRepo.createQueryBuilder('question')
      .select('MAX(question.order)')
      .where('question.sessionId = :sessionId', { sessionId })
      .getRawOne()

    const questionInstance = questionsRepo.create({
      question,
      sessionId,
      order: (maxOrder.max ?? -1) + 1
    })

    const savedQuestion = await questionsRepo.save(questionInstance)
    await publish(savedQuestion)
    return savedQuestion
  }

  @Authorized(AuthLevels.ADMIN)
  @Mutation(returns => Question)
  async openQuestion (
    @PubSub('questions') publish: Publisher<Question>,
    @Ctx() { sessionId }: Context,
    @Arg('questionId', type => ID) questionId: number
  ): Promise<Question | undefined> {
    const connection = await this.pool
    const questionsRepo = connection.getRepository(Question)

    const questionInstance = await questionsRepo.findOneOrFail({
      where: {
        id: questionId,
        sessionId
      }
    })

    if (questionInstance.openedAt) throw new ApolloError('Already Opened', 'ALREADY_OPENED')

    questionInstance.openedAt = new Date()

    const savedQuestion = await questionsRepo.save(questionInstance)
    await publish(savedQuestion)
    return savedQuestion
  }

  @Authorized(AuthLevels.ADMIN)
  @Mutation(returns => Question)
  async closeQuestion (
    @PubSub('questions') publish: Publisher<Question>,
    @PubSub('votes') publishVote: Publisher<Vote>,
    @Ctx() { sessionId, loaders }: Context,
    @Arg('questionId', type => ID) questionId: number
  ): Promise<Question | undefined> {
    const connection = await this.pool
    const questionsRepo = connection.getRepository(Question)
    const voteRepo = connection.getRepository(Vote)

    const questionInstance = await questionsRepo.findOneOrFail({
      where: {
        id: questionId,
        sessionId
      }
    })

    if (!questionInstance.openedAt) throw new ApolloError('Not Yet Opened', 'NOT_OPENED')
    if (questionInstance.closedAt) throw new ApolloError('Already Closed', 'ALREADY_CLOSED')

    questionInstance.closedAt = new Date()

    const publishers: Promise<void>[] = []
    await connection.transaction(async manager => {
      const savedQuestion = await manager.save(questionInstance)
      publishers.push(publish(savedQuestion))
      console.log(await manager.findOne(Question, { where: { id: questionId }, relations: ['blockedVoters'] }))
      const blockedVoters = (await manager.findOne(Question, { where: { id: questionId }, relations: ['blockedVoters'] }))?.blockedVoters ?? []
      const voted = await manager.find(Vote, { where: { questionId }, select: ['voterId'] })
      const ignoredVoters = [...blockedVoters.map(blockedVoter => blockedVoter.id), ...voted.map(voter => voter.voterId)]
      const toAbstain = await manager.createQueryBuilder(Voter, 'voter')
        .select('voter.id')
        .where('voter.sessionId = :sessionId')
        .andWhere(ignoredVoters.length ? 'voter.id NOT IN (:...ignoredVoters)' : 'TRUE')
        .setParameters({ sessionId, ignoredVoters })
        .getMany()
      const votes = await manager.save(Vote,
        toAbstain.map(voter =>
          voteRepo.create({
            questionId,
            vote: VoteOptions.ABSTAIN,
            voterId: voter.id
          })
        ))
      console.log(blockedVoters, voted, ignoredVoters, toAbstain, votes)
      for (const vote of votes) {
        vote.sessionId = sessionId
        publishers.push(publishVote(vote))
      }
    })

    await Promise.all(publishers)
    return questionInstance
  }

  @Authorized(AuthLevels.ADMIN)
  @Mutation(returns => Question)
  async removeQuestion (
    @PubSub('questions') publish: Publisher<Question>,
    @Ctx() { sessionId }: Context,
    @Arg('questionId', type => ID) questionId: string
  ): Promise<Question> {
    const connection = await this.pool
    const questionsRepo = connection.getRepository(Question)

    const questionInstance = await questionsRepo.findOneOrFail({
      where: {
        id: questionId,
        sessionId
      }
    })

    if (questionInstance.openedAt) throw new ApolloError('Can\'t remove a question that has been opened')

    await connection.transaction(async manager => {
      await manager.delete(Question, questionInstance)
      await manager.createQueryBuilder()
        .update(Question)
        .set({
          order: () => '"order" - 1'
        })
        .where('order > :removedOrder', { removedOrder: questionInstance.order })
        .execute()
    })
    questionInstance.deletedAt = new Date()
    await publish(questionInstance)
    return questionInstance
  }

  @Authorized(AuthLevels.ADMIN)
  @Mutation(returns => [Question])
  async reorderQuestion (
    @PubSub('questions') publish: Publisher<Question>,
    @Ctx() { sessionId }: Context,
    @Arg('questionId', type => ID) questionId: string,
    @Arg('direction', type => Directions) direction: Directions
  ) {
    const connection = await this.pool

    return connection.transaction(async manager => {
      const questionToMove = await manager.findOneOrFail(Question, {
        where: {
          id: questionId,
          sessionId
        }
      })

      if (direction === Directions.EARLIER && questionToMove.order === 0) throw new ApolloError('Cannot move, already first')

      const questionToSwap = await manager.findOne(Question, {
        where: {
          sessionId,
          order: direction === Directions.EARLIER ? questionToMove.order - 1 : questionToMove.order + 1
        }
      })

      if (!questionToSwap) throw new ApolloError('Cannot move, already last')

      const prev = questionToMove.order
      questionToMove.order = questionToSwap.order
      questionToSwap.order = prev === 0 ? -1 : -prev
      await manager.save([questionToSwap, questionToMove])
      questionToSwap.order = prev
      await manager.save(questionToSwap)

      await publish(questionToSwap)
      await publish(questionToMove)
      return [questionToMove, questionToSwap]
    })
  }

  @FieldResolver(returns => Session)
  @Authorized(AuthLevels.ADMIN, AuthLevels.VOTER, AuthLevels.AUDIENCE)
  async session (@Root() question: Question): Promise<Session> {
    const connection = await this.pool
    const sessionsRepo = connection.getRepository(Session)

    return sessionsRepo.findOne(question.sessionId) as Promise<Session>
  }

  @FieldResolver(returns => [Vote])
  async votes (@Ctx() { loaders }: Context, @Root() question: Question): Promise<Vote[]> {
    return loaders.voteLoader.load(question.id)
  }

  @FieldResolver(returns => [Voter])
  async blockedVoters (@Ctx() { loaders }: Context, @Root() question: Question): Promise<Voter[]> {
    return loaders.blockedVotersLoader.load(question.id)
  }

  @Authorized(AuthLevels.ADMIN, AuthLevels.VOTER, AuthLevels.AUDIENCE)
  @Subscription({
    topics: 'questions',
    filter: ({ payload, context }: ResolverFilterData<Question, any, Context>) => context.sessionId === payload.sessionId
  })
  questionSubscription (@Root() question: Question): Question {
    return question
  }
}
