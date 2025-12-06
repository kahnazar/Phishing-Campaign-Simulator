import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { findAllTemplates, findTemplateById } from '../services/templateService';
import { mapTemplate } from '../services/mappers';

const templateRouter = Router();

templateRouter.use(authenticate);

templateRouter.get('/', async (_req, res, next) => {
  try {
    const templates = await findAllTemplates();
    res.json(templates.map(mapTemplate));
  } catch (error) {
    next(error);
  }
});

templateRouter.get('/:id', async (req, res, next) => {
  try {
    const template = await findTemplateById(req.params.id);
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    return res.json(mapTemplate(template));
  } catch (error) {
    return next(error);
  }
});

export default templateRouter;
