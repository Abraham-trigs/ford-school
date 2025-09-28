// pages/api/auth/session.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserSessionContext } from '@/lib/auth/authService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { userId, sessionKey } = req.query;
    const context = await getUserSessionContext(Number(userId), String(sessionKey));
    res.status(200).json(context);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}
