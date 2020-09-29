import { Entity, JoinTable, ManyToMany, PrimaryColumn } from 'typeorm'
import Session from './session'

@Entity()
export default class User {
  @PrimaryColumn()
  id!: string // uuid

  @ManyToMany(type => Session, session => session.admins)
  @JoinTable()
  sessions!: Session[]
}
