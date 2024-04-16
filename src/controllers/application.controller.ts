import { Request, Response } from 'express';
import { CreateApplicationInput } from "../schemas/application.schema";
import {
    createApplicationService,
    getApplicationsService,
    updateApplicationService
} from "../services/application.service";
import { findStudentByIdentifierService } from "../services/student.service";

export const createApplicationHandler = async (
    req: Request<{}, {}, CreateApplicationInput>,
    res: Response
) => {
    const student = await findStudentByIdentifierService(res.locals.user.username);

    if(!student) {
        return res.status(404).json({
            status: 'fail',
            message: 'Студент не найден(а)',
        });
    }

    const application = await createApplicationService(req.body, student);
    res.status(201).json({
        status: 'success',
        data: application,
    });
}

export const getApplicationsHandler = async (
    req: Request,
    res: Response
) => {

    const isStudent = res.locals.user.roles.includes('student');
    const student = isStudent ? await findStudentByIdentifierService(res.locals.user.username): null;

    const applications = await getApplicationsService(student ? student.id : undefined);

    const modifiedApplications = applications.filter(i => i.student);

    res.status(200).json({
        status: 'success',
        data: {
            applications: modifiedApplications,
        },
    });
}

export const updateApplicationHandler = async (
    req: Request,
    res: Response
) => {
    const { id } = req.params;
    const application = await updateApplicationService(id, req.body.response);

    res.status(200).json({
        status: 'success',
        data: application,
    });
}