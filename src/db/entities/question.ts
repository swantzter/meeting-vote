import { Field, ID, ObjectType, GraphQLTimestamp as Timestamp } from 'type-graphql'
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { DateTransformer } from '../helpers'
import Session from './session'
import Vote from './vote'

@Entity()
@ObjectType()
export default class Question {
  @PrimaryGeneratedColumn('increment')
  @Field(type => ID)
  id!: number;

  @Column()
  @Field()
  question!: string

  @Column('timestamp', { nullable: true, transformer: DateTransformer })
  @Field(type => Timestamp, { nullable: true })
  openedAt?: Date

  @Column('timestamp', { nullable: true, transformer: DateTransformer })
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
}
