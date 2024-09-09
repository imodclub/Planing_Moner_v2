// pages/api/expense-data/[userId].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/models/db';
import Session from '@/models/session.model';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { sessionId } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await Session.findOne({ sessionId });
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    const userId = session.data.userId; // สมมติว่ามี userId ใน session data
    return res.status(200).json({ userId });
  } catch (error) {
    console.error('Error fetching userID:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}