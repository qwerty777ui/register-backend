import express from 'express';
import {
  loginUserHandler,
  logoutHandler,
  refreshAccessTokenHandler,
  registerUserHandler,
  verifyEmailHandler,
} from '../controllers/auth.controller';
import { deserializeUser } from '../middlewares/deserializeUser';
import { requireUser } from '../middlewares/requireUser';
import { validate } from '../middlewares/validate';
import {
  createUserSchema,
  loginUserSchema,
  verifyEmailSchema,
} from '../schemas/user.schema';
import { getMeHandler } from "../controllers/user.controller";

const router = express.Router();

router.get('/me', getMeHandler);

// Register user
router.post('/register', validate(createUserSchema), registerUserHandler);

// Login user
router.post('/login', validate(loginUserSchema), loginUserHandler);

// Logout user
router.get('/logout', deserializeUser, requireUser, logoutHandler);

// Refresh access token
router.get('/refresh', refreshAccessTokenHandler);

// Verify Email Address
router.get(
  '/verifyemail/:verificationCode',
  validate(verifyEmailSchema),
  verifyEmailHandler
);

export default router;
