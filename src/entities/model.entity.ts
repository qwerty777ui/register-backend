import {
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  BaseEntity, JoinColumn, ManyToOne, DeleteDateColumn,
} from 'typeorm';
import { User } from "./user.entity";

export default abstract class Model extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User, user => user.id, {
    onDelete: "SET NULL",
    nullable: true
  })
  @JoinColumn({name: "deleted_by"})
  deleted_by: User;

  @DeleteDateColumn()
  deleted_at: Date;

  toJSON() {
    return {
      ...this,
      created_by: undefined,
      updated_by: undefined,
      deleted_by: undefined,
      updated_at: undefined,
      deleted_at: undefined,
    }
  }
}
