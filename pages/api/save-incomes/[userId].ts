import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/models/db';
import Income from '@/models/incomes.model';
import mongoose from 'mongoose';

interface Income {
  label: string;
  amount?: number | string;
  comment?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect(); // เชื่อมต่อกับฐานข้อมูล

  const { userId } = req.query;
  

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // ตรวจสอบและแปลง userId เป็น ObjectId หากจำเป็น
    if (!mongoose.Types.ObjectId.isValid(userId as string)) {
      return res.status(400).json({ message: 'Invalid userId format' });
    }

    // ค้นหาข้อมูลโดยใช้ฟิลด์ userId แทน _id
    const user = await Income.findOne({ userId: userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // ดึงข้อมูล items ที่มี label
    const itemsWithLabel = user.items.map((item: Income) => ({
      label: item.label,
      amount: item.amount || '',
      comment: item.comment || '',
    }));

    // ส่งข้อมูล items กลับไป
    return res.status(200).json({ name: user.name, items: itemsWithLabel });
  } catch (error) {
    console.error('Error fetching user items:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
