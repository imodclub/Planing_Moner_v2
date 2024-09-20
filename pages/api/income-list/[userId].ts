import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/models/db';
import IncomeList from '@/models/incomes-list.model';
import mongoose from 'mongoose';

interface IncomeItem {
  label: string;
  amount: number;
  comment: string;
}

const defaultItems: IncomeItem[] = [
  { label: 'เงินเดือน', amount: 0, comment: '' },
  { label: 'รายได้เสริม', amount: 0, comment: '' },
  { label: 'ดอกเบี้ยและเงินปันผล', amount: 0, comment: '' },
  { label: 'รายได้จากการถูกล็อตเตอรี่/หวย', amount: 0, comment: '' },
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();
  const { userId } = req.query;

  if (!mongoose.Types.ObjectId.isValid(userId as string)) {
    return res.status(400).json({ message: 'Invalid userId format' });
  }

  switch (req.method) {
    case 'GET':
      return handleGet(req, res, userId as string);
    case 'POST':
      return handlePost(req, res, userId as string);
    case 'DELETE':
      return handleDelete(req, res, userId as string);
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    console.log("Fetching income list for userId:", userId);
    let latestIncomeList = await IncomeList.findOne({ userId })
      .sort({ _id: -1 })
      .select('items createdAt _id');

      if (!latestIncomeList) {
        console.log("No income list found, creating default list");
        const newIncomeList = new IncomeList({
          userId,
          items: defaultItems,
          timestamp: new Date(),
        });
        latestIncomeList = await newIncomeList.save();
      }

    const itemsWithLabel = latestIncomeList.items.map((item: IncomeItem) => ({
      label: item.label,
      amount: '',
      comment: item.comment ?? '',
    }));

    console.log("Sending response:", {
      items: itemsWithLabel,
      createdAt: latestIncomeList.createdAt,
      _id: latestIncomeList._id
    });

    return res.status(200).json({
      items: itemsWithLabel,
      createdAt: latestIncomeList.createdAt,
      _id: latestIncomeList._id
    });
  } catch (error) {
    console.error('Error in handleGet:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const { items, timestamp } = req.body;
    const newIncomeList = new IncomeList({
      userId,
      timestamp,
      items: items,
    });
    await newIncomeList.save();
    return res.status(200).json({ message: 'Income list saved successfully' });
  } catch (error) {
    console.error('Error saving income list:', error);
    return res.status(500).json({ message: 'Failed to save income list' });
  }
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const { index } = req.body;
    const latestIncomeList = await IncomeList.findOne({ userId }).sort({ _id: -1 });

    if (!latestIncomeList) {
      return res.status(404).json({ message: 'Income list not found for this user' });
    }

    if (index < 0 || index >= latestIncomeList.items.length) {
      return res.status(400).json({ message: 'Invalid item index' });
    }

    latestIncomeList.items.splice(index, 1);
    await latestIncomeList.save();
    return res.status(200).json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}