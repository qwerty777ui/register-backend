import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import Model from "./model.entity";
import { Student } from "./student.entity";

@Entity('applications')
export class Application extends Model {
    @Column({
        type: "enum",
        enum: ["pending", "answered"],
        default: "pending",
    })
    status: string;

    @Column()
    message: string;

    @Column({nullable: true})
    response: string;

    @ManyToOne(() => Student, student => student.applications, {onDelete: "SET NULL"})
    @JoinColumn({name: "student_id"})
    student: Student;

    toJSON() {
        return {
            ...this,
            deleted_at: undefined
        }
    }
}