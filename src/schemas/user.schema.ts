import { array, nativeEnum, object, string, TypeOf } from 'zod';
import { UserRole } from '../entities/user.entity';
import { humanSchema } from "./human.schema";

export const createUserSchema = object({
  body: object({
    username: string({
      required_error: 'Имя пользователя обязательно',
    }),
    password: string({
      required_error: 'Пароль обязателен',
    }),
    roles: array(nativeEnum(UserRole, {
      required_error: 'Роль обязательна',
    })),
    email: string({
      required_error: 'Email обязателен',
    }).email('Неверный формат email').optional(),
    permissions: array(string()).optional(),
  })
})

export const loginUserSchema = object({
  body: object({
    username: string({
      required_error: 'username is required',
    }),
    password: string({
      required_error: 'Password is required',
    }).min(8, 'Invalid email or password'),
  }),
});

export const verifyEmailSchema = object({
  params: object({
    verificationCode: string(),
  }),
});

export type CreateUserInput = Omit<
  TypeOf<typeof createUserSchema>['body'],
  'passwordConfirm'
>;

export type LoginUserInput = TypeOf<typeof loginUserSchema>['body'];
export type VerifyEmailInput = TypeOf<typeof verifyEmailSchema>['params'];
