// pages/api/income-list.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/models/db';
import SavingList from '@/models/saving-list.model';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method === 'POST') {
    const { items, userId,timestamp } = req.body;

    try {
      const newSavingList = new SavingList({
          userId,
          timestamp,
        items: items,
      });

      await newSavingList.save();
      res.status(200).json({ message: 'Saving list saved successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to save saving list' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}