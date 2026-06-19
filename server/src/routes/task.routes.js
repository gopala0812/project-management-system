import { Router } from 'express';
import {
  createTask,
  deleteTask,
  getTask,
  listTasks,
  updateTask
} from '../controllers/task.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { idParamSchema } from '../validators/common.js';
import { createTaskSchema, taskListSchema, updateTaskSchema } from '../validators/task.validators.js';

const router = Router();

router.use(requireAuth);
router.get('/', validate(taskListSchema), listTasks);
router.get('/:id', validate(idParamSchema), getTask);
router.post('/', validate(createTaskSchema), createTask);
router.put('/:id', validate(updateTaskSchema), updateTask);
router.delete('/:id', validate(idParamSchema), deleteTask);

export default router;
