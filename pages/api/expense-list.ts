// pages/api/income-list.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/models/db';
import ExpenseList from '@/models/expenses-list.model';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method === 'POST') {
    const { items, userId,timestamp } = req.body;

    try {
      const newExpenseList = new ExpenseList({
          userId,
          timestamp,
        items: items,
      });

      await newExpenseList.save();
      res.status(200).json({ message: 'Expense list saved successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to save expense list' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}