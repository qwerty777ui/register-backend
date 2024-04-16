import {Router} from "express";
import {requireUser} from "../middlewares/requireUser";
import {deserializeUser} from "../middlewares/deserializeUser";
import {validate} from "../middlewares/validate";
import {
    createStudentHandler, deleteStudentHandler,
    getStudentsHandler,
    getStudentHandler,
    updateStudentHandler
} from "../controllers/student.controller";
import {
    createStudentSchema,
    deleteStudentSchema,
    getStudentSchema,
    updateStudentSchema
} from "../schemas/student.schema";
import {paginateQuerySchema} from "../schemas/pagination.schema";

const router = Router()

router.use(deserializeUser, requireUser)

router.route('/')
    .get( validate(paginateQuerySchema), getStudentsHandler)
    .post( validate(createStudentSchema), createStudentHandler)

router.route('/:id')
    .get( validate(getStudentSchema), getStudentHandler)
    .patch( validate(updateStudentSchema), updateStudentHandler)
    .delete( validate(deleteStudentSchema), deleteStudentHandler)

export default router;
