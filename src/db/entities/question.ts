import { Field, ID, ObjectType, GraphQLTimestamp as Timestamp } from 'type-graphql'
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import Session from './session'
import Vote from './vote'
import Voter from './voter'

@Entity()
@ObjectType()
export default class Question {
  @PrimaryGeneratedColumn('increment')
  @Field(type => ID)
  id!: number;

  @Column()
  @Field()
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

  @ManyToMany(type => Voter)
  @JoinTable({ name: 'voter_block' })
  @Field(type => [Voter])
  blockedVoters!: Voter[]
}
