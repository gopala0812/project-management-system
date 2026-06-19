import prisma from '../lib/prisma.js';

export async function getDashboard(req, res, next) {
  try {
    const ownerId = req.user.id;
    const [
      totalProjects,
      totalTasks,
      completedTasks,
      pendingTasks,
      projectsInProgress
    ] = await Promise.all([
      prisma.project.count({ where: { ownerId } }),
      prisma.task.count({ where: { ownerId } }),
      prisma.task.count({ where: { ownerId, status: 'COMPLETED' } }),
      prisma.task.count({ where: { ownerId, status: 'PENDING' } }),
      prisma.project.count({ where: { ownerId, status: 'IN_PROGRESS' } })
    ]);

    res.json({
      totalProjects,
      totalTasks,
      completedTasks,
      pendingTasks,
      projectsInProgress
    });
  } catch (error) {
    next(error);
  }
}
