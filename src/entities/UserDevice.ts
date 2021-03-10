import {
  Entity,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
  CreateDateColumn,
  DeleteDateColumn
} from 'typeorm'

import { Device } from './Device'
import { User } from './User'

@Entity()
export class UserDevice {
  @PrimaryGeneratedColumn( 'increment', { type: 'bigint', unsigned: true } ) id: number

  @ManyToOne( () => User )
  @JoinColumn() user: User

  @ManyToOne( () => Device )
  @JoinColumn() device: Device

  @CreateDateColumn() createdAt: Date
  @DeleteDateColumn() deletedAt: Date | null
}
