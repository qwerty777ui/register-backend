import {NextFunction, Request, Response} from "express";
import {
    createStudentService,
    deleteStudentService,
    findStudentService,
    findStudentsService,
    updateStudentService
} from "../services/student.service";
import {
    CreateStudentInput,
    DeleteStudentInput,
    GetStudentInput,
    UpdateStudentInput
} from "../schemas/student.schema";
import AppError from "../utils/appError";
import {FindOptionsWhere, ILike} from "typeorm";
import {Student} from "../entities/student.entity";
import {Order} from "../utils/enums";
import {PaginateQueryInput} from "../schemas/pagination.schema";
import { deleteUserService } from "../services/user.service";

type DynamicWhere<T> = {
    [P in keyof T]?: FindOptionsWhere<T[P]> | any;
} & {
    [key: string]: any; // Add a string index signature
};

export const getMeAsStudentHandler = async (
    _: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = res.locals.user;

        const student = await findStudentService({user: {id: user.id}})

        if (!student) {
            return next(new AppError(404, "Студент не найден"))
        }

        res.status(200).json({
            status: 'success',
            data: {student},
        });
    } catch (err: any) {
        next(err);
    }
}

export const createStudentHandler = async (
    req: Request<{}, {}, CreateStudentInput>,
    res: Response,
    next: NextFunction
) => {
    try {
        const student = await createStudentService({input: req.body, user: res.locals.user});

        res.status(201).json({
            status: "success",
            data: {student}
        })
    } catch (err: any) {
        if (err.code === "23505") {
            return res.status(409).json({
                status: "fail",
                message: "Студент уже существует"
            })
        }
        next(err);
    }
}

export const getStudentsHandler = async (
    req: Request<{}, {}, {}, PaginateQueryInput>,
    res: Response,
    next: NextFunction
) => {

    try {
        const {
            take,
            skip,
            order = Order.ASC,
            sort_by = "identifier",
            search = "",
            search_by = ""
        } = req.query

        const fields = ['identifier', "first_name", "last_name", "middle_name", "group", "passport_number"]

        if (!fields.includes(<string>sort_by)) {
            return next(new AppError(400, `Неверный параметр: ${sort_by}`));
        }

        const query_order: Record<string, any> = {};
        if (sort_by.includes(".")) {
            const [relation, field] = sort_by.split(".")
            query_order[relation] = {[field]: order}
        } else {
            query_order[sort_by] = order
        }

        const where: DynamicWhere<Student> = {};

        if (search_by) {
            if (search_by.includes(".")) {
                const [relation, field] = search_by.split(".");
                if (!where[relation]) {
                    where[relation] = {};
                }
                (where[relation] as Record<string, any>)[field] = ILike(`%${search}%`);
            } else {
                where[search_by as keyof typeof where] = ILike(`%${search}%`);
            }
        }

        const [students, total] = await findStudentsService(
            where,
            {},
            {user: true},
            query_order,
            take as number,
            skip as number,
        )
        res.status(200).json({
            status: "success",
            data: {students, total}
        })
    } catch (e) {
        next(e)
    }
}

export const getStudentHandler = async (
    req: Request<GetStudentInput>,
    res: Response,
    next: NextFunction
) => {
    try {
        const student = await findStudentService(
            { id: req.params.id},
            {user: true }
        )

        if (!student) {
            return next(new AppError(404, "Студент не найден(а)"))
        }

        res.status(200).json({
            status: "success",
            data: {student}
        })
    } catch (e) {
        next(e)
    }
}

export const updateStudentHandler = async (
    req: Request<GetStudentInput, {}, UpdateStudentInput>,
    res: Response,
    next: NextFunction
) => {
    try {

        const updatedStudent = await updateStudentService({
            student_id: req.params.id,
            input: req.body,
            user: res.locals.user
        })

        res.status(200).json({
            status: "success",
            data: {student: updatedStudent}
        })
    } catch (e: any) {
        if (e.code === "23505") {
            return res.status(409).json({
                status: "fail",
                message: "Студент уже существует"
            })
        }
        next(e)
    }
}

export const deleteStudentHandler = async (
    req: Request<DeleteStudentInput>,
    res: Response,
    next: NextFunction
) => {
    try {
        const student = await findStudentService(
            {id: req.params.id},
            ['user']
        )

        if (!student) {
            return next(new AppError(404, "Студент не найден"))
        }

        await deleteStudentService({id: student.id, user: res.locals.user})
        if(student.user) await deleteUserService( student.user.id, res.locals.user )

        res.status(204).json({
            status: "success",
            data: null
        })
    } catch (e) {
        next(e)
    }
}
