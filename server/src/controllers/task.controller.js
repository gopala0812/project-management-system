import prisma from '../lib/prisma.js';
import { HttpError } from '../lib/httpError.js';

async function assertOwnedProject(projectId, ownerId) {
  const project = await prisma.project.findFirst({ where: { id: projectId, ownerId } });
  if (!project) {
    throw new HttpError(404, 'Project not found.');
  }
  return project;
}

function taskPayload(body) {
  return {
    name: body.name,
    description: body.description ?? null,
    priority: body.priority,
    status: body.status,
    dueDate: body.dueDate
  };
}

export async function listTasks(req, res, next) {
  try {
    const { search, status, priority, projectId, page, limit, sortBy, sortOrder } = req.query;
    const where = {
      ownerId: req.user.id,
      ...(status ? { status } : {}),
      ...(priority ? { priority } : {}),
      ...(projectId ? { projectId } : {}),
      ...(search ? { name: { contains: search, mode: 'insensitive' } } : {})
    };
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: { project: { select: { id: true, name: true } } }
      }),
      prisma.task.count({ where })
    ]);

    res.json({ items, page, limit, total });
  } catch (error) {
    next(error);
  }
}

export async function getTask(req, res, next) {
  try {
    const task = await prisma.task.findFirst({
      where: { id: req.params.id, ownerId: req.user.id },
      include: { project: { select: { id: true, name: true } } }
    });

    if (!task) {
      throw new HttpError(404, 'Task not found.');
    }

    res.json(task);
  } catch (error) {
    next(error);
  }
}

export async function createTask(req, res, next) {
  try {
    await assertOwnedProject(req.body.projectId, req.user.id);
    const task = await prisma.task.create({
      data: {
        ...taskPayload(req.body),
        projectId: req.body.projectId,
        ownerId: req.user.id
      }
    });

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
}

export async function updateTask(req, res, next) {
  try {
    const existing = await prisma.task.findFirst({
      where: { id: req.params.id, ownerId: req.user.id }
    });

    if (!existing) {
      throw new HttpError(404, 'Task not found.');
    }

    if (req.body.projectId) {
      await assertOwnedProject(req.body.projectId, req.user.id);
    }

    const task = await prisma.task.update({
      where: { id: existing.id },
      data: {
        ...taskPayload({ ...existing, ...req.body }),
        projectId: req.body.projectId ?? existing.projectId
      }
    });

    res.json(task);
  } catch (error) {
    next(error);
  }
}

export async function deleteTask(req, res, next) {
  try {
    const existing = await prisma.task.findFirst({
      where: { id: req.params.id, ownerId: req.user.id }
    });

    if (!existing) {
      throw new HttpError(404, 'Task not found.');
    }

    await prisma.task.delete({ where: { id: existing.id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
