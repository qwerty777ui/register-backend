import { Router } from "express";
import {
    createApplicationHandler,
    getApplicationsHandler,
    updateApplicationHandler
} from "../controllers/application.controller";
import { deserializeUser } from "../middlewares/deserializeUser";
import { requireUser } from "../middlewares/requireUser";

const router = Router();

router.use(deserializeUser, requireUser);

router
    .route('/')
    .get(getApplicationsHandler)
    .post(createApplicationHandler);

router
    .route('/:id')
    .patch(updateApplicationHandler);

export default router;