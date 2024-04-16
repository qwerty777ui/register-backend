import {AppDataSource} from "../utils/data-source";
import {
    FindOptionsOrder,
    FindOptionsRelations,
    FindOptionsSelect,
    FindOptionsWhere,
    In,
    Not,
    QueryRunner
} from "typeorm";
import { CreateStudentInput, UpdateStudentInput} from "../schemas/Student.schema";
import {User} from "../entities/user.entity";
import AppError from "../utils/appError";
import {Student} from "../entities/student.entity";
import {ZodError, ZodIssue} from "zod";
import {GENDER} from "../entities/human.entity";

const studentRepo = AppDataSource.getRepository(Student)

export const findStudentsService = async (
    where: FindOptionsWhere<Student> = {},
    select: FindOptionsSelect<Student> = {},
    relations: FindOptionsRelations<Student> = {},
    order: FindOptionsOrder<Student> = {},
    take?: number,
    skip?: number
) => {
    return await studentRepo.findAndCount({
        where,
        select,
        relations,
        order,
        take,
        skip,
    });
}

export const findStudentService = async (
    where: FindOptionsWhere<Student> = {},
    relations: FindOptionsRelations<Student> = {}
) => {
    return await studentRepo.findOne({where, relations});
}

export const isUniqueIdentifierService = async (identifier: string, exclude_id?: string) => {
    return await studentRepo.findOne(
        {
            where: {
                identifier,
                id: exclude_id ? Not(exclude_id) : undefined
            }}
    );
}

export const isUniquePassportService = async (passport: string, exclude_id?: string) => {
    return await studentRepo.findOne({
        where: {
            passport_number: passport,
            id: exclude_id ? Not(exclude_id) : undefined
        }
    });
}

export const createStudentService = async ({input, user}: { input: CreateStudentInput, user: User }) => {

    const errors: ZodIssue[] = []

    if (await isUniqueIdentifierService(input.identifier)) {
        errors.push({path: ["identifier"], message: "Студент с таким идентификатором уже существует"} as ZodIssue)
    }

    if (await isUniquePassportService(input.passport_number)) {
        errors.push({path: ["passport_number"], message: "Студент с таким паспортом уже существует"} as ZodIssue)
    }

    if (errors.length) {
        throw new ZodError(errors)
    }

    const preparedInput = {
        ...input,
        pinfl: input.pinfl || undefined,
        email: input.email || undefined,
        birth_date: input.birth_date || undefined,
    };

    const student = studentRepo.create({
        ...preparedInput,
        created_by: user
    });

    await studentRepo.save(student);

    return student;
};

export const updateStudentService = async ({student_id, input, user}: {
    student_id: string,
    input: UpdateStudentInput,
    user: User
}) => {
    const student = await findStudentService({id: student_id})

    if (!student) {
        throw new AppError(404, "Студент не найден")
    }

    const errors: ZodIssue[] = []

    if (input.identifier && await isUniqueIdentifierService(input.identifier, student.id)) {
        errors.push({path: ["identifier"], message: "Студент с таким идентификатором уже существует"} as ZodIssue)
    }

    if (input.passport_number && await isUniquePassportService(input.passport_number, student.id)) {
        errors.push({path: ["passport_number"], message: "Студент с таким паспортом уже существует"} as ZodIssue)
    }

    if (errors.length) {
        throw new ZodError(errors)
    }
    const preparedInput = {
        ...input,
        pinfl: input.pinfl || null,
        email: input.email || null,
        birth_date: input.birth_date || undefined
    };

    Object.assign(student, preparedInput, {updated_by: user});

    await studentRepo.save(student);

    return student;
}

export const deleteStudentService = async ({id, user}: { id: string, user: User }) => {
    return await studentRepo.delete({id})
}

export const findStudentByIdentifierService = async (identifier: string) => {
    return await studentRepo.findOneBy({identifier});
}

export const restoreStudentService = async(identifier: string) => {
    const queryBuilder = await studentRepo.createQueryBuilder('student');

    queryBuilder.withDeleted();

}
