// src/routes/auth.js

import { Router } from 'express';
import { z } from 'zod';
import { verifyGoogleToken } from '../services/auth.js';
import { signToken } from '../services/jwt.js';

const router = Router();

const schema = z.object({
  idToken: z.string().min(10)
});

router.post('/google', async (req, res, next) => {
  try {
    const { idToken } = schema.parse(req.body);

    const user = await verifyGoogleToken(idToken);

    // 🔐 Later: upsert user into DB
    const jwtToken = signToken({
      userId: user.googleId,
      email: user.email,
      name: user.name
    });

    res.json({
      token: jwtToken,
      user: {
        email: user.email,
        name: user.name,
        picture: user.picture
      }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
