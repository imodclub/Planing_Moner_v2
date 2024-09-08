// pages/api/expense-data/[userId].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/models/db';
import Expense from '@/models/expenses.model';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  const { userId } = req.query;

  if (req.method === 'GET') {
    try {
      const expenses = await Expense.find({ userId });
      res.status(200).json(expenses);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch expenses' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}