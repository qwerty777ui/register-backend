import { NextFunction, Request, Response } from 'express';
import { findStudentService } from "../services/student.service";

export const getMeHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = res.locals.user;

    if(user.roles.includes('student')) {
      user.student = await findStudentService(
          {identifier: user.username}
      );
    }

    res.status(200).status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (err: any) {
    next(err);
  }
};

