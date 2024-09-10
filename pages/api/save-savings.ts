// pages/api/save-expenses.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/models/db';
import Saving from '@/models/savings.model';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method === 'POST') {
    const { date, savingItem, userId, timestamp } = req.body;

    try {
      const newSaving = new Saving({
        userId,
        date,
        timestamp,
        items: savingItem,
      });

      await newSaving.save();
      res.status(200).json({ message: 'Saving saved successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to save saving' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}