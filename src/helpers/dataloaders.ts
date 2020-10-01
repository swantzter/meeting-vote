import DataLoader from 'dataloader'
import { Connection } from 'typeorm'
import Question from '../db/entities/question'
import Vote from '../db/entities/vote'
import Voter from '../db/entities/voter'

export default (pool: Promise<Connection>) => ({
  questionLoader: new DataLoader<number, Question | undefined>(async questionIds => {
    const connection = await pool
    const questionRepo = connection.getRepository(Question)
    const questions = await questionRepo.find({ where: questionIds.map(id => ({ id })) })
    return questionIds.map(questionId => questions.find(question => question.id === Number(questionId)))
  }),

  voteLoader: new DataLoader<number, Vote[]>(async questionIds => {
    const connection = await pool
    const voteRepo = connection.getRepository(Vote)
    const votes = await voteRepo.find({ where: questionIds.map(questionId => ({ questionId })) })
    return questionIds.map(questionId => votes.filter(vote => vote.questionId === Number(questionId)))
  }),

  blockedVotersLoader: new DataLoader<number, Voter[]>(async (questionIds) => {
    const connection = await pool
    const questionRepo = connection.getRepository(Question)
    const questions = await questionRepo.find({ where: questionIds.map(questionId => ({ id: questionId })), relations: ['blockedVoters'] })
    return questionIds.map(questionId => questions.find(question => question.id === Number(questionId))?.blockedVoters ?? [])
  })
})
