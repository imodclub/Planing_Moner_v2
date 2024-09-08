// pages/api/save-expenses.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/models/db';
import Expense from '@/models/expenses.model';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method === 'POST') {
    const { date, expenseItems, userId, timestamp } = req.body;

    try {
      const newExpense = new Expense({
        userId,
        date,
        timestamp,
        items: expenseItems,
      });

      await newExpense.save();
      res.status(200).json({ message: 'Expenses saved successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to save expenses' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}