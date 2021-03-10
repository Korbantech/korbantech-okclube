import {
  Column,
  Entity,
  PrimaryColumn,
  CreateDateColumn,
  DeleteDateColumn
} from 'typeorm'

@Entity()
export class Device {
  @PrimaryColumn() id: number

  @Column( { nullable: true } ) token: string

  @Column() name: string
  @Column() os: string
  @Column( 'timestamp', { default: () => 'CURRENT_TIMESTAMP' } ) usedAt: Date

  @CreateDateColumn() createdAt: Date
  @DeleteDateColumn() deletedAt: Date | null
}
