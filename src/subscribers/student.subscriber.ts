import {EventSubscriber, EntitySubscriberInterface, UpdateEvent, InsertEvent, SoftRemoveEvent} from "typeorm";
import {Student} from "../entities/student.entity";
import {connectNewInstanceToUser} from "../services/user.service";


@EventSubscriber()
export class StudentSubscriber implements EntitySubscriberInterface<Student> {
    listenTo() {
        return Student;
    }

    afterUpdate(event: UpdateEvent<Student>): Promise<any> | void {
        console.log(`AFTER STUDENT UPDATED: `, event.entity);
    }

    afterInsert(event: InsertEvent<Student>): Promise<any> | void {
        console.log(`AFTER STUDENT INSERTED: `, event.entity);
        connectNewInstanceToUser(event.entity)
    }

    afterSoftRemove(event: SoftRemoveEvent<Student>): Promise<any> | void {
        console.log(`AFTER STUDENT SOFT REMOVED: `, event.databaseEntity);
    }
}