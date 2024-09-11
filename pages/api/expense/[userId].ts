import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/models/db';
import Expense from '@/models/expenses.model';
import mongoose from 'mongoose';

interface ExpenseItem {
  label: string;
  amount?: number | string;
  comment?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();

  const { userId } = req.query;

  switch (req.method) {
    case 'GET':
      try {
        if (!mongoose.Types.ObjectId.isValid(userId as string)) {
          return res.status(400).json({ message: 'Invalid userId format' });
        }

        const userExpenses = await Expense.find({ userId: userId });
        if (!userExpenses || userExpenses.length === 0) {
          return res
            .status(404)
            .json({ message: 'No expense data found for this user' });
        }

        const formattedExpenses = userExpenses.map((expense) => ({
          date: expense.date,
          items: expense.items.map((item: ExpenseItem) => ({
            label: item.label,
            amount: item.amount || '',
            comment: item.comment || '',
          })),
        }));

        return res.status(200).json({ expenses: formattedExpenses });
      } catch (error) {
        console.error('Error fetching user expenses:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }

    case 'POST':
      try {
        const { date, expenseItems, timestamp } = req.body;
        const newExpense = new Expense({
          userId,
          date,
          timestamp,
          items: expenseItems,
        });
        await newExpense.save();
        res.status(200).json({ message: 'Expenses saved successfully' });
      } catch (error) {
        console.error('Error saving expense:', error);
        res.status(500).json({ error: 'Failed to save expenses' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
