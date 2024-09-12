import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyAuth } from '@/lib/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const user = await verifyAuth(req);
    res.status(200).json(user);
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed' });
  }
}
