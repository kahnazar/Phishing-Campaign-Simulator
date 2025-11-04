import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import prisma from '../config/database';
import { mapTemplate } from '../services/mappers';

const templateRouter = Router();

templateRouter.use(authenticate);

templateRouter.get('/', async (_req, res, next) => {
  try {
    const templates = await prisma.template.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(templates.map(mapTemplate));
  } catch (error) {
    next(error);
  }
});

templateRouter.get('/:id', async (req, res, next) => {
  try {
    const template = await prisma.template.findUnique({
      where: { id: req.params.id },
    });
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    return res.json(mapTemplate(template));
  } catch (error) {
    return next(error);
  }
});

export default templateRouter;
