import { CookieOptions, NextFunction, Request, Response } from 'express';
import config from 'config';
import crypto from 'crypto';
import {
  CreateUserInput,
  LoginUserInput,
  VerifyEmailInput,
} from '../schemas/user.schema';
import {
  createUser, createUserForStudent,
  findUser,
  findUserByEmail,
  findUserById,
  signTokens,
} from '../services/user.service';
import AppError from '../utils/appError';
import redisClient from '../utils/connectRedis';
import { signJwt, verifyJwt } from '../utils/jwt';
import { User } from '../entities/user.entity';
import Email from '../utils/email';
import { findStudentByIdentifierService } from "../services/student.service";
import { Student } from "../entities/student.entity";
import { MESSAGES, STATUS_CODES } from "../utils/constants";

const cookiesOptions: CookieOptions = {
  httpOnly: false,
  sameSite: 'lax',
};

if (process.env.NODE_ENV === 'production') cookiesOptions.secure = true;

const accessTokenCookieOptions: CookieOptions = {
  ...cookiesOptions,
  expires: new Date(
    Date.now() + config.get<number>('accessTokenExpiresIn') * 60 * 1000
  ),
  maxAge: config.get<number>('accessTokenExpiresIn') * 60 * 1000,
};

const refreshTokenCookieOptions: CookieOptions = {
  ...cookiesOptions,
  expires: new Date(
    Date.now() + config.get<number>('refreshTokenExpiresIn') * 60 * 1000
  ),
  maxAge: config.get<number>('refreshTokenExpiresIn') * 60 * 1000,
};

export const registerUserHandler = async (
  req: Request<{}, {}, CreateUserInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, password, email } = req.body;

    const newUser = await createUser({
      username,
      password,
    });

    await newUser.save();

    res.status(201).json({
      status: 'success',
      message:
          'User successfully created',
    });
  } catch (err: any) {
    if (err.code === '23505') {
      return res.status(409).json({
        status: 'fail',
        message: 'User with that email already exist',
      });
    }
    console.log(err);
    next(err);
  }
};

export const loginUserHandler = async (
  req: Request<{}, {}, LoginUserInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, password } = req.body;

    let user = await findUser({ username:  username });

    // 1. Check if user exist
    if (!user) {
      user = await handleNewUser(username, password);

      if (!user) {
        return next(new AppError(400, MESSAGES.INVALID_CREDENTIALS));
      }
    } else if (!(await User.comparePasswords(password, user.password))) {
      return next(new AppError(STATUS_CODES.NOT_FOUND, MESSAGES.INVALID_CREDENTIALS));
    }

    // 2.Check if user is verified
    // if (!user.verified) {
    //   return next(
    //     new AppError(
    //       401,
    //       'You are not verified, check your email to verify your account'
    //     )
    //   );
    // }

    //3. Check if password is valid
    // if (!(await User.comparePasswords(password, user.password))) {
    //   return next(new AppError(400, 'Invalid email or password'));
    // }

    // 4. Sign Access and Refresh Tokens
    const { access_token, refresh_token } = await signTokens(user);

    // 5. Add Cookies
    res.cookie('access_token', access_token, accessTokenCookieOptions);
    res.cookie('refresh_token', refresh_token, refreshTokenCookieOptions);
    res.cookie('logged_in', true, {
      ...accessTokenCookieOptions,
      httpOnly: false,
    });

    // 6. Send response
    res.status(200).json({
      status: 'success',
      access_token,
    });
  } catch (err: any) {
    next(err);
  }
};

export const verifyEmailHandler = async (
  req: Request<VerifyEmailInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const verificationCode = crypto
      .createHash('sha256')
      .update(req.params.verificationCode)
      .digest('hex');

    const user = await findUser({ verificationCode });

    if (!user) {
      return next(new AppError(401, 'Could not verify email'));
    }

    user.verified = true;
    user.verificationCode = null;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Email verified successfully',
    });
  } catch (err: any) {
    next(err);
  }
};

export const refreshAccessTokenHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refresh_token = req.cookies.refresh_token;

    const message = 'Could not refresh access token';

    if (!refresh_token) {
      return next(new AppError(403, message));
    }

    // Validate refresh token
    const decoded = verifyJwt<{ sub: string }>(
      refresh_token,
      'refreshTokenPublicKey'
    );

    if (!decoded) {
      return next(new AppError(403, message));
    }

    // Check if user has a valid session
    const session = await redisClient.get(decoded.sub);

    if (!session) {
      return next(new AppError(403, message));
    }

    // Check if user still exist
    const user = await findUserById(JSON.parse(session).id);

    if (!user) {
      return next(new AppError(403, message));
    }

    // Sign new access token
    const access_token = signJwt({ sub: user.id }, 'accessTokenPrivateKey', {
      expiresIn: `${config.get<number>('accessTokenExpiresIn')}m`,
    });

    // 4. Add Cookies
    res.cookie('access_token', access_token, accessTokenCookieOptions);
    res.cookie('logged_in', true, {
      ...accessTokenCookieOptions,
      httpOnly: false,
    });

    // 5. Send response
    res.status(200).json({
      status: 'success',
      access_token,
    });
  } catch (err: any) {
    next(err);
  }
};

const logout = (res: Response) => {
  res.cookie('access_token', '', { maxAge: 1 });
  res.cookie('refresh_token', '', { maxAge: 1 });
  res.cookie('logged_in', '', { maxAge: 1 });
};

export const logoutHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = res.locals.user;

    await redisClient.del(user.id);
    logout(res);

    res.status(200).json({
      status: 'success',
    });
  } catch (err: any) {
    next(err);
  }
};

async function handleNewUser(username: string, password: string) {
  const userTypes = [
    {service: findStudentByIdentifierService, creator: createUserForStudent},
  ];

  for (const {service, creator} of userTypes) {
    const entity = await service(username);
    if (entity && entity.passport_number.toUpperCase() === password) {
      return creator(entity as Student);
    }
  }

  return null;
}
