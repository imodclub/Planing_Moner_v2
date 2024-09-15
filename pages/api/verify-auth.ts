// verify-auth.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyAuth } from '@/lib/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Pragma', 'no-cache');

  try {
    const user = await verifyAuth(req);
    res.status(200).json({ isAuthenticated: true, user });
  } catch (error) {
    res.status(401).json({ isAuthenticated: false, error: 'Unauthorized' });
  }
}
