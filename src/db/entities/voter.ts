import { Field, ID, ObjectType } from 'type-graphql'
import { Column, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm'
import Question from './question'
import Session from './session'
import Vote from './vote'
import { IsAlphanumeric } from 'class-validator'

@Entity()
@ObjectType()
@Unique('uniqueVoterPerSession', ['id', 'sessionId'])
export default class Voter {
  @PrimaryGeneratedColumn('increment')
  dbId!: number

  @Column()
  @Field(type => ID)
  @IsAlphanumeric()
  id!: string

  // does this need to be a password hash? nah probably not
  // should it be salted? eh, maybe
  @Column({ length: 60, type: 'char' })
  // no need to show this in gql
  key!: string

  @OneToMany(type => Vote, vote => vote.voter)
  votes!: Vote[]

  @ManyToOne(type => Session, session => session.voters)
  session!: Session

  @Column()
  sessionId!: string

  @ManyToMany(type => Question, question => question.blockedVoters)
  blockedFrom!: Question[]
}
