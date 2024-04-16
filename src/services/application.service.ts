import { CreateApplicationInput } from "../schemas/application.schema";
import { AppDataSource } from "../utils/data-source";
import { Application } from "../entities/application.entity";
import { Student } from "../entities/student.entity";

const applicationRepository = AppDataSource.getRepository(Application);

export const createApplicationService = async (input: CreateApplicationInput, student: Student) => {
    return await applicationRepository.save({
        ...input,
        student: student
    });
}

export const getApplicationsService = async (studentId) => {
    return await applicationRepository.find({
        where: {
            student: studentId ? {id: studentId} : undefined
        },
        relations: ["student"]
    });
}

export const updateApplicationService = async (applicationId: string, response: string) => {
    const application = await applicationRepository.findOne({
        where: {id: applicationId}
    });

    if (!application) {
        return null;
    }

    application.response = response;
    if(response) application.status = 'answered';

    return await applicationRepository.save(application);
}