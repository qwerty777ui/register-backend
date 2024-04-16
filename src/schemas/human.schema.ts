import {GENDER} from "../entities/human.entity";
import {nativeEnum, object, string, literal, date} from "zod";

export const humanSchema = object({
    identifier: string({
        required_error: "Идентификатор обязателен",
    }),
    last_name: string({
        required_error: "Фамилия обязательна",
    }),
    first_name: string({
        required_error: "Имя обязательно",
    }),
    middle_name: string().optional(),
    pinfl: string().length(14, {
        message: "Пинфл должен состоять из 14 символов"
    }).nullable().optional().or(literal("")),
    passport_number: string({
        required_error: "Номер паспорта обязателен",
    }).min(7, {
        message: "Номер паспорта должен состоять из 7 символов"
    }).max(14, {
        message: "Номер паспорта должен состоять из 14 символов"
    }),
    email: string().email().nullable().optional().or(literal('')),
    birth_date: string().refine((arg) =>
        arg.match(
            /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)((-(\d{2}):(\d{2})|Z)?)$/
        )).nullable().optional(),
    gender: nativeEnum(GENDER).optional(),
});
