import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  JoinColumn,
  ManyToOne
} from 'typeorm'

import { Newspaper } from './Newspaper'
import { User } from './User'

@Entity()
export class UserVisualizedNewspaper {
  @PrimaryGeneratedColumn( 'increment', { type: 'bigint', unsigned: true } ) id: number

  @ManyToOne( () => User )
  @JoinColumn() user: User

  @ManyToOne( () => Newspaper )
  @JoinColumn() newspaper: Newspaper

  @CreateDateColumn() at: Date
}
