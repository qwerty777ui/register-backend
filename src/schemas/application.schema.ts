import { object, string, TypeOf } from "zod";

export const createApplicationSchema = object({
    body: object({
        message: string({
            required_error: 'Message is required',
        }),
    }),
});

export type CreateApplicationInput = TypeOf<typeof createApplicationSchema>['body'];