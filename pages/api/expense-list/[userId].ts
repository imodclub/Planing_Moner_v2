import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/models/db';
import ExpenseList from '@/models/expenses-list.model';
import mongoose from 'mongoose';

interface ExpenseItem {
  label: string;
  amount: string;
  comment: string;
}

const defaultItems: ExpenseItem[] = [
  { label: 'ค่าอาหาร', amount: '', comment: '' },
  { label: 'ค่าเดินทาง', amount: '', comment: '' },
  { label: 'ค่าที่พัก', amount: '', comment: '' },
  { label: 'ค่าสาธารณูปโภค', amount: '', comment: '' },
  { label: 'ค่าใช้จ่ายส่วนตัว', amount: '', comment: '' },
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
    console.log("Fetching expense list for userId:", userId);
    let latestExpenseList = await ExpenseList.findOne({ userId })
      .sort({ _id: -1 })
      .select('items createdAt _id');

    if (!latestExpenseList) {
      console.log("No expense list found, creating default list");
      const newExpenseList = new ExpenseList({
        userId,
        items: defaultItems,
        timestamp: new Date(),
      });
      latestExpenseList = await newExpenseList.save();
    }

    const itemsWithLabel = latestExpenseList.items.map((item: ExpenseItem) => ({
      label: item.label,
      amount: '',
      comment: item.comment ?? '',
    }));

    console.log("Sending response:", {
      items: itemsWithLabel,
      createdAt: latestExpenseList.createdAt,
      _id: latestExpenseList._id
    });

    return res.status(200).json({
      items: itemsWithLabel,
      createdAt: latestExpenseList.createdAt,
      _id: latestExpenseList._id
    });
  } catch (error) {
    console.error('Error in handleGet:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const { items, timestamp } = req.body;
    const newExpenseList = new ExpenseList({
      userId,
      timestamp,
      items: items,
    });
    await newExpenseList.save();
    return res.status(200).json({ message: 'Expense list saved successfully' });
  } catch (error) {
    console.error('Error saving expense list:', error);
    return res.status(500).json({ message: 'Failed to save expense list' });
  }
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const { index } = req.body;
    const latestExpenseList = await ExpenseList.findOne({ userId }).sort({ _id: -1 });

    if (!latestExpenseList) {
      return res.status(404).json({ message: 'Expense list not found for this user' });
    }

    if (index < 0 || index >= latestExpenseList.items.length) {
      return res.status(400).json({ message: 'Invalid item index' });
    }

    latestExpenseList.items.splice(index, 1);
    await latestExpenseList.save();
    return res.status(200).json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}