// pages/api/save-expenses.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/models/db';
import IncomeType from '@/models/incomes-type.model';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method === 'POST') {
    const { incomeItem, userId } = req.body;

    try {
      const newIncomeType = new IncomeType({
        userId,  
        items: incomeItem,
      });

      await newIncomeType.save();
      res.status(200).json({ message: 'Income Type saved successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to save income Type' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}