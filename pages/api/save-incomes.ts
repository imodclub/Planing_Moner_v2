// pages/api/save-expenses.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/models/db';
import Income from '@/models/incomes.model';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method === 'POST') {
    const { date, incomeItem, userId, timestamp } = req.body;

    try {
      const newIncome = new Income({
        userId,
        date,
        timestamp,
        items: incomeItem,
      });

      await newIncome.save();
      res.status(200).json({ message: 'Income saved successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to save income' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}