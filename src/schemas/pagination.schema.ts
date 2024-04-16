import {nativeEnum, object, string, TypeOf} from "zod";
import {Order} from "../utils/enums";

export const paginateQuerySchema = object({
    query: object({
        take: string()
            .transform((val) => parseInt(val, 10))
            .refine(val => !isNaN(val) && val >= 10 && val <= 100, 'Объем страницы должно быть числом от 10 до 100.')
            .optional(),
        skip: string()
            .transform((val) => parseInt(val, 10))
            .refine(val => !isNaN(val) && val >= 0, 'Пропуск должен быть неотрицательным числом.')
            .optional(),
        order: nativeEnum(Order).default(Order.DESC),
        sort_by: string(),
        search: string().min(3, "").optional(),
        search_by: string().optional()
    }).partial()
})

export type PaginateQueryInput = TypeOf<typeof paginateQuerySchema>['query']