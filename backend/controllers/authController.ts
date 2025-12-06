import { Router } from 'express';
import { verifyPassword } from '../services/passwordService';
import { createToken } from '../services/tokenService';
import { authenticate } from '../middleware/auth';
import { findUserByEmail, sanitizeUser, updateUser } from '../services/userService';

const authRouter = Router();

authRouter.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }

    const user = await findUserByEmail(email);
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = createToken({
      sub: user.id,
      role: user.role,
      email: user.email,
      name: user.name,
    });

    await updateUser(user.id, { lastLoginAt: new Date() });

    return res.json({
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return next(error);
  }
});

authRouter.get('/me', authenticate, (req, res) => {
  return res.json(req.user);
});

export default authRouter;
