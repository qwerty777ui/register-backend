import config from 'config';
import { omit } from 'lodash';
import { User, UserRole } from '../entities/user.entity';
import redisClient from '../utils/connectRedis';
import { AppDataSource } from '../utils/data-source';
import { signJwt } from '../utils/jwt';
import { Student } from "../entities/student.entity";

const userRepository = AppDataSource.getRepository(User);

export const createUser = async (input: Partial<User>) => {
  return await userRepository.save(userRepository.create(input));
};

export const findUserByEmail = async ({ email }: { email: string }) => {
  return await userRepository.findOneBy({ email });
};

export const findUserById = async (userId: string) => {
  return await userRepository.findOneBy({ id: userId });
};

export const findUser = async (query: Object) => {
  return await userRepository.findOneBy(query);
};
export const signTokens = async (user: User) => {
  // 1. Create Session
  redisClient.set(user.id, JSON.stringify(user), {
    EX: config.get<number>('redisCacheExpiresIn') * 60,
  });

  // 2. Create Access and Refresh tokens
  const access_token = signJwt({ sub: user.id }, 'accessTokenPrivateKey', {
    expiresIn: `${config.get<number>('accessTokenExpiresIn')}m`,
  });

  const refresh_token = signJwt({ sub: user.id }, 'refreshTokenPrivateKey', {
    expiresIn: `${config.get<number>('refreshTokenExpiresIn')}m`,
  });

  return { access_token, refresh_token };
};

export const verifyUserService = async ({user}: { user: User }) => {
  user.verified = true
  user.verified_at = new Date()
  return await user.save()
}

export const connectNewInstanceToUser = async (instance: Student) => {
  const user = await userRepository.findOneBy({username: instance.identifier})

  if (!user) {
    return null
  }

  if (instance instanceof Student) {
    user.student = instance
    user.roles.push(UserRole.STUDENT)
  }

  return await user.save()
}

export const createUserForStudent = async (student: Student) => {
  let user = await userRepository.findOneBy({username: student.identifier})

  if (!user) {
    user = userRepository.create({
      username: student.identifier,
      password: student.passport_number,
      roles: [UserRole.STUDENT],
      student
    })
  } else {
    user.roles.push(UserRole.STUDENT)
    user.student = student
  }

  return await userRepository.save(user)
}

export const deleteUserService = async (id: string, user: User) => {
  return await userRepository.softDelete({id}).then(() => {
    return userRepository.update({id}, {deleted_by: user})
  });
}