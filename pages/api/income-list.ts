// pages/api/income-list.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/models/db';
import IncomeList from '@/models/incomes-list.model';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method === 'POST') {
    const { items, userId,timestamp } = req.body;

    try {
      const newIncomeList = new IncomeList({
          userId,
          timestamp,
        items: items,
      });

      await newIncomeList.save();
      res.status(200).json({ message: 'Income list saved successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to save income list' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}