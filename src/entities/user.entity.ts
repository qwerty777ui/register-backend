import {
  Entity,
  Column,
  Index,
  BeforeInsert,
  OneToOne,
  PrimaryGeneratedColumn,
  BaseEntity,
  CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn
} from 'typeorm';
import {Student} from "./student.entity";
import bcrypt from 'bcryptjs';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  STUDENT = 'student',
}

@Entity('users')
export class User extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  @Index({unique: true})
  username: string;

  @Column()
  password: string;

  @Column({nullable: true})
  @Index({unique: true})
  phone?: string;

  @Column({nullable: true})
  email?: string;

  @Column({type: 'enum', enum: UserRole, array: true, default: [UserRole.ADMIN]})
  roles: UserRole[];

  @Column({default: false})
  isActive: boolean;

  @Column({default: false})
  verified: boolean;

  @OneToOne(() => Student, student => student.user, {onDelete: "CASCADE"})
  student?: Student;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  @Column("timestamptz", {nullable: true})
  verified_at: Date;

  @ManyToOne(() => User, {nullable: true})
  @JoinColumn({name: "verified_by"})
  created_by: User;

  @ManyToOne(() => User, {nullable: true})
  @JoinColumn({name: "updated_by"})
  updated_by: User;

  @ManyToOne(() => User, {nullable: true})
  @JoinColumn({name: "deleted_by"})
  deleted_by: User;

  toJSON() {
    return {...this, password: undefined};
  }

  @BeforeInsert()
  async hashPassword() {
    try {
      this.password = await bcrypt.hash(this.password, 12);
    } catch (error) {
      console.error("Error hashing password:", error);
      throw new Error("Error hashing password");
    }
  }

  static async comparePasswords(candidatePassword: string, hashedPassword: string) {
    try {
      return await bcrypt.compare(candidatePassword, hashedPassword);
    } catch (error) {
      console.error("Error comparing passwords:", error);
      throw new Error("Error comparing passwords");
    }
  }
}
