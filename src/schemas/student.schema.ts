import {object, string, TypeOf} from "zod";
import {humanSchema} from "./human.schema";

export const createStudentSchema = object({
    body: humanSchema.extend({
        group: string({
            required_error: "Группа обязательна",
        }),
        faculty: string({
            required_error: "Факультет обязателен",
        })
    })
})


const params = {
    params: object({
        id: string()
    })
}

export const getStudentSchema = object({
    ...params,
});

export const updateStudentSchema = object({
    ...params,
    body: humanSchema.extend({

    }).partial(),
});

export const deleteStudentSchema = object({
    ...params,
});


export type CreateStudentInput = TypeOf<typeof createStudentSchema>['body'];
export type GetStudentInput = TypeOf<typeof getStudentSchema>['params'];
export type UpdateStudentInput = TypeOf<typeof updateStudentSchema>['body'];
export type DeleteStudentInput = TypeOf<typeof deleteStudentSchema>['params'];