import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { findAllCampaigns, createCampaign, updateCampaign, deleteCampaign } from '../services/campaignService';
import { mapCampaign } from '../services/mappers';
import type { CampaignStatus } from '../services/campaignService';

const campaignRouter = Router();

campaignRouter.use(authenticate);

campaignRouter.get('/', async (_req, res, next) => {
  try {
    const campaigns = await findAllCampaigns();
    res.json(campaigns.map(mapCampaign));
  } catch (error) {
    next(error);
  }
});

campaignRouter.post('/', requireRole('ADMIN', 'MANAGER'), async (req, res, next) => {
  try {
    const { name, templateId, recipientCount, description, scheduledAt } = req.body;

    if (!name || !templateId || !recipientCount) {
      return res.status(400).json({ message: 'name, templateId and recipientCount are required' });
    }

    const template = await prisma.template.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const status: CampaignStatus = scheduledAt ? 'SCHEDULED' : 'DRAFT';

    const campaign = await createCampaign({
      name,
      description,
      templateId,
      recipientsCount: Number(recipientCount),
      status,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      createdById: user.id,
    });

    const campaignWithTemplate = await findAllCampaigns();
    const created = campaignWithTemplate.find(c => c.id === campaign.id);
    res.status(201).json(mapCampaign(created || campaign));
  } catch (error) {
    next(error);
  }
});

campaignRouter.put('/:id', requireRole('ADMIN', 'MANAGER'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData: any = {};

    if (req.body.name !== undefined) updateData.name = req.body.name;
    if (req.body.description !== undefined) updateData.description = req.body.description;
    if (req.body.status !== undefined) updateData.status = req.body.status;
    if (req.body.templateId !== undefined) updateData.templateId = req.body.templateId;
    if (req.body.scheduledAt !== undefined) {
      updateData.scheduledAt = req.body.scheduledAt ? new Date(req.body.scheduledAt) : null;
    }
    if (req.body.recipientsCount !== undefined) {
      updateData.recipientsCount = Number(req.body.recipientsCount);
    }

    const campaign = await updateCampaign(id, updateData);
    const campaignWithTemplate = await findAllCampaigns();
    const updated = campaignWithTemplate.find(c => c.id === campaign.id);
    res.json(mapCampaign(updated || campaign));
  } catch (error: any) {
    if (error.message === 'Campaign not found') {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    next(error);
  }
});

campaignRouter.delete('/:id', requireRole('ADMIN'), async (req, res, next) => {
  try {
    const { id } = req.params;

    await deleteCampaign(id);

    res.status(204).end();
  } catch (error: any) {
    if (error.message === 'Campaign not found') {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    next(error);
  }
});

export default campaignRouter;

