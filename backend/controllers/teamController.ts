import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { findAllTeamMembers, createTeamMember, findTeamMemberByUserId, updateTeamMember, deleteTeamMember } from '../services/teamService';
import { mapTeamMember } from '../services/mappers';
import type { UserRole } from '../services/userService';
import { hashPassword } from '../services/passwordService';
import { createUser, findUserByEmail, updateUser } from '../services/userService';

const teamRouter = Router();

teamRouter.use(authenticate);

teamRouter.get('/', async (_req, res, next) => {
  try {
    const teamMembers = await findAllTeamMembers();
    res.json(teamMembers.map(mapTeamMember));
  } catch (error) {
    next(error);
  }
});

teamRouter.post('/', requireRole('ADMIN'), async (req, res, next) => {
  try {
    const { email, role, name } = req.body;
    if (!email || !role) {
      return res.status(400).json({ message: 'email and role are required' });
    }

    const validRoles: UserRole[] = ['ADMIN', 'MANAGER', 'VIEWER', 'AUDITOR'];
    if (!validRoles.includes(role as UserRole)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const derivedName =
      name ||
      email
        .split('@')[0]
        .replace(/[._]/g, ' ')
        .replace(/\b\w/g, (letter) => letter.toUpperCase());

    // Check if user already exists
    let user = await findUserByEmail(email.toLowerCase());

    if (!user) {
      // Create user with a temporary password (should be changed on first login)
      const tempPassword = `temp_${Math.random().toString(36).slice(2)}`;
      const passwordHash = hashPassword(tempPassword);

      user = await createUser({
        email: email.toLowerCase(),
        name: derivedName,
        role: role as UserRole,
        passwordHash,
      });
    } else {
      // Update existing user's role if needed
      if (user.role !== role) {
        user = await updateUser(user.id, { role: role as UserRole });
      }
    }

    // Check if team member already exists
    let teamMember = await findTeamMemberByUserId(user.id);

    if (!teamMember) {
      teamMember = await createTeamMember({
        userId: user.id,
        name: derivedName,
        email: email.toLowerCase(),
        role: role as UserRole,
        campaignCount: 0,
        lastActiveLabel: 'Just now',
      });
    }

    const result = await findAllTeamMembers();
    const created = result.find(tm => tm.id === teamMember.id);

    res.status(201).json(mapTeamMember(created || teamMember));
  } catch (error: any) {
    if (error.message?.includes('unique') || error.message?.includes('duplicate')) {
      return res.status(409).json({ message: 'Team member with this email already exists' });
    }
    next(error);
  }
});

teamRouter.put('/:id', requireRole('ADMIN'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, role, teamName } = req.body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email.toLowerCase();
    if (role !== undefined) {
      const validRoles: UserRole[] = ['ADMIN', 'MANAGER', 'VIEWER', 'AUDITOR'];
      if (!validRoles.includes(role as UserRole)) {
        return res.status(400).json({ message: 'Invalid role' });
      }
      updateData.role = role;
    }
    if (teamName !== undefined) updateData.teamName = teamName;

    const teamMember = await updateTeamMember(id, updateData);

    // Also update the user if role changed
    if (role) {
      await updateUser(teamMember.userId, { role: role as UserRole });
    }

    const result = await findAllTeamMembers();
    const updated = result.find(tm => tm.id === teamMember.id);

    res.json(mapTeamMember(updated || teamMember));
  } catch (error: any) {
    if (error.message === 'Team member not found') {
      return res.status(404).json({ message: 'Team member not found' });
    }
    next(error);
  }
});

teamRouter.delete('/:id', requireRole('ADMIN'), async (req, res, next) => {
  try {
    const { id } = req.params;

    await deleteTeamMember(id);

    res.status(204).end();
  } catch (error: any) {
    if (error.message === 'Team member not found') {
      return res.status(404).json({ message: 'Team member not found' });
    }
    next(error);
  }
});

export default teamRouter;

