import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/models/db';
import Saving from '@/models/savings.model';
import mongoose from 'mongoose';

interface SavingItem {
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
  console.log('Received data in API:', JSON.stringify(req.body, null, 2));

  switch (req.method) {
    case 'GET':
      try {
        if (!mongoose.Types.ObjectId.isValid(userId as string)) {
          return res.status(400).json({ message: 'Invalid userId format' });
        }

        const userSavings = await Saving.find({ userId: userId });
        if (!userSavings || userSavings.length === 0) {
          return res
            .status(404)
            .json({ message: 'No saving data found for this user' });
        }

        const formattedSavings = userSavings.map((saving) => ({
          date: saving.date,
          items: saving.items.map((item: SavingItem) => ({
            label: item.label,
            amount: item.amount || '',
            comment: item.comment || '',
          })),
        }));

        return res.status(200).json({ savings: formattedSavings });
      } catch (error) {
        console.error('Error fetching user savings:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }

      case 'POST':
  try {
    const { date, items, timestamp } = req.body;
    console.log('Received data:', { date, items, timestamp });

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: 'Invalid or missing items data' });
    }

    const newSaving = new Saving({
      userId,
      date,
      timestamp,
      items: items.map(item => ({
        ...item,
        amount: item.amount ? parseFloat(item.amount) : 0
      }))
    });

    await newSaving.save();
    res.status(200).json({ message: 'Saving saved successfully' });
  } catch (error) {
    console.error('Error saving saving:', error);
    res.status(500).json({ error: 'Failed to save saving' });
  }
  break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
