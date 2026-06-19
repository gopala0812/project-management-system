import prisma from '../lib/prisma.js';
import { HttpError } from '../lib/httpError.js';

function projectPayload(body) {
  return {
    name: body.name,
    description: body.description ?? null,
    status: body.status,
    startDate: body.startDate,
    endDate: body.endDate
  };
}

export async function listProjects(req, res, next) {
  try {
    const { search, status, page, limit, sortBy, sortOrder } = req.query;
    const where = {
      ownerId: req.user.id,
      ...(status ? { status } : {}),
      ...(search ? { name: { contains: search, mode: 'insensitive' } } : {})
    };
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: { _count: { select: { tasks: true } } }
      }),
      prisma.project.count({ where })
    ]);

    res.json({ items, page, limit, total });
  } catch (error) {
    next(error);
  }
}

export async function getProject(req, res, next) {
  try {
    const project = await prisma.project.findFirst({
      where: { id: req.params.id, ownerId: req.user.id },
      include: { tasks: { orderBy: { createdAt: 'desc' } } }
    });

    if (!project) {
      throw new HttpError(404, 'Project not found.');
    }

    res.json(project);
  } catch (error) {
    next(error);
  }
}

export async function createProject(req, res, next) {
  try {
    const project = await prisma.project.create({
      data: {
        ...projectPayload(req.body),
        ownerId: req.user.id
      }
    });

    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
}

export async function updateProject(req, res, next) {
  try {
    const existing = await prisma.project.findFirst({
      where: { id: req.params.id, ownerId: req.user.id }
    });

    if (!existing) {
      throw new HttpError(404, 'Project not found.');
    }

    const project = await prisma.project.update({
      where: { id: existing.id },
      data: projectPayload({ ...existing, ...req.body })
    });

    res.json(project);
  } catch (error) {
    next(error);
  }
}

export async function deleteProject(req, res, next) {
  try {
    const existing = await prisma.project.findFirst({
      where: { id: req.params.id, ownerId: req.user.id }
    });

    if (!existing) {
      throw new HttpError(404, 'Project not found.');
    }

    await prisma.project.delete({ where: { id: existing.id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
