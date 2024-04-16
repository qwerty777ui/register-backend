import express from 'express';
import { getMeHandler } from '../controllers/user.controller';
import { deserializeUser } from '../middlewares/deserializeUser';
import { requireUser } from '../middlewares/requireUser';

const router = express.Router();

router.use(deserializeUser, requireUser);

// Get currently logged in user
router.get('/me', getMeHandler);

export default router;
