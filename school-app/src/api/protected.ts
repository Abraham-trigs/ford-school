// pages/api/protected.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken, getUserSessionContext } from '@/lib/auth/authService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Missing token' });

    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);

    const context = await getUserSessionContext(payload.userId, payload.sessionKey);

    res.status(200).json({ context });
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
}
