import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyAuth } from '@/lib/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // ตั้งค่า headers เพื่อป้องกันการแคช
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Pragma', 'no-cache');

  if (req.method === 'GET') {
    try {
      const user = await verifyAuth(req);
      res.status(200).json({ isAuthenticated: true, user });
    } catch (error) {
      res.status(401).json({ isAuthenticated: false, error: 'Unauthorized' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}