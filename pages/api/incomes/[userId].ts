import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/models/db';
import Income from '@/models/incomes.model';
import mongoose from 'mongoose';

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

        const user = await Income.findOne({ userId: userId });
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }

        const itemsWithLabel = user.items.map((item: any) => ({
          label: item.label,
          amount: item.amount || '',
          comment: item.comment || '',
        }));

        return res.status(200).json({ name: user.name, items: itemsWithLabel });
      } catch (error) {
        console.error('Error fetching user items:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }

    case 'POST':
      try {
        const { date, items, timestamp } = req.body;
        const newIncome = new Income({
          userId,
          date,
          timestamp,
          items: items,
        });
        await newIncome.save();
        res.status(200).json({ message: 'Income saved successfully' });
      } catch (error) {
        res.status(500).json({ error: 'Failed to save income' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
