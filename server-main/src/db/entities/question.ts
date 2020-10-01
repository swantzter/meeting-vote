import { Field, ID, ObjectType, GraphQLTimestamp as Timestamp, Int } from 'type-graphql'
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm'
import Session from './session'
import Vote from './vote'
import Voter from './voter'
import { Matches } from 'class-validator'

@Entity()
@ObjectType()
@Unique('uniqueOrdinalPerSession', ['sessionId', 'order'])
export default class Question {
  @PrimaryGeneratedColumn('increment')
  @Field(type => ID)
  id!: number

  @Column('int')
  @Field(type => Int)
  order!: number

  @Column()
  @Field()
  @Matches(/^[\w\d\s-?!]+$/i)
  question!: string

  @Column('timestamp', { nullable: true })
  @Field(type => Timestamp, { nullable: true })
  openedAt?: Date

  @Column('timestamp', { nullable: true })
  @Field(type => Timestamp, { nullable: true })
  closedAt?: Date

  @ManyToOne(type => Session, session => session.questions)
  @JoinColumn({ name: 'sessionId' })
  @Field(type => Session)
  session!: Session

  @Column()
  sessionId!: string

  @OneToMany(type => Vote, vote => vote.question)
  votes!: Vote[]

  @ManyToMany(type => Voter, voter => voter.blockedFrom)
  @JoinTable({ name: 'voter_block' })
  @Field(type => [Voter])
  blockedVoters!: Voter[]

  @Field(type => Timestamp, { nullable: true, description: 'Only sent with subscriptions to signify deletion' })
  deletedAt?: Date
}
