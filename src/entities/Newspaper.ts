import {
  Column,
  Entity,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn
} from 'typeorm'

@Entity()
export class Newspaper {
  @PrimaryColumn() id: string
  @Column() url: string
  @Column() cover: string
  @Column( 'timestamp' ) showAt: Date
  @Column() pages: number

  @CreateDateColumn() createdAt: Date
  @UpdateDateColumn() updatedAt: Date
  @DeleteDateColumn() deletedAt: Date | null
}
