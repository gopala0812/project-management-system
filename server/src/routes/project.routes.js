import { Router } from 'express';
import {
  createProject,
  deleteProject,
  getProject,
  listProjects,
  updateProject
} from '../controllers/project.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { idParamSchema } from '../validators/common.js';
import {
  createProjectSchema,
  projectListSchema,
  updateProjectSchema
} from '../validators/project.validators.js';

const router = Router();

router.use(requireAuth);
router.get('/', validate(projectListSchema), listProjects);
router.get('/:id', validate(idParamSchema), getProject);
router.post('/', validate(createProjectSchema), createProject);
router.put('/:id', validate(updateProjectSchema), updateProject);
router.delete('/:id', validate(idParamSchema), deleteProject);

export default router;
