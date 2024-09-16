import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/models/db';
import SavingsList from '@/models/saving-list.model';
import mongoose from 'mongoose';

interface SavingItem {
  label: string;
  amount: string;
  comment: string;
}

const defaultItems: SavingItem[] = [
  { label: 'เงินฝาก', amount: '', comment: '' },
  { label: 'เงินลงทุนหุ้นระยะยาว', amount: '', comment: '' },
  { label: 'เงินลงทุนหุ้น DCA', amount: '', comment: '' },
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
      console.log("Fetching saving list for userId:", userId);
      let latestSavingList = await SavingsList.findOne({ userId })
        .sort({ _id: -1 })
        .select('items createdAt _id');
  
      if (!latestSavingList) {
        console.log("No saving list found, creating default list");
        const newSavingList = new SavingsList({
          userId,
          items: defaultItems,
          timestamp: new Date(),
        });
        latestSavingList = await newSavingList.save();
      }
  
      const itemsWithLabel = latestSavingList.items.map((item: SavingItem) => ({
        label: item.label,
        amount: '',
        comment: item.comment ?? '',
      }));
  
      console.log("Sending response:", {
        items: itemsWithLabel,
        createdAt: latestSavingList.createdAt,
        _id: latestSavingList._id
      });
  
      return res.status(200).json({
        items: itemsWithLabel,
        createdAt: latestSavingList.createdAt,
        _id: latestSavingList._id
      });
    } catch (error) {
      console.error('Error in handleGet:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

async function handlePost(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  try {
    const { items, timestamp } = req.body;
    const newSavingList = new SavingsList({
      userId,
      timestamp,
      items: items,
    });
    await newSavingList.save();
    return res.status(200).json({ message: 'Saving list saved successfully' });
  } catch (error) {
    console.error('Error saving saving list:', error);
    return res.status(500).json({ message: 'Failed to save saving list' });
  }
}

async function handleDelete(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  try {
    const { index } = req.body;
    const latestSavingList = await SavingsList.findOne({ userId }).sort({
      _id: -1,
    });

    if (!latestSavingList) {
      return res
        .status(404)
        .json({ message: 'Saving list not found for this user' });
    }

    if (index < 0 || index >= latestSavingList.items.length) {
      return res.status(400).json({ message: 'Invalid item index' });
    }

    latestSavingList.items.splice(index, 1);
    await latestSavingList.save();

    return res.status(200).json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
