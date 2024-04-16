import { Column, Entity, JoinColumn, OneToMany, OneToOne } from "typeorm";
import { Human } from "./human.entity";
import { User } from "./user.entity";
import { Application } from "./application.entity";

@Entity("students")
export class Student extends Human {
    @OneToOne(() => User, user => user.student, { nullable: true, onDelete: "SET NULL" })
    @JoinColumn({ name: "user_id" })
    user?: User;

    @Column()
    group: string;

    @Column()
    faculty: string;

    @OneToMany(() => Application, application => application.student, { onDelete: "SET NULL" })
    applications: Application[];

    toJSON() {
        return {
            ...this
        }
    }
}
