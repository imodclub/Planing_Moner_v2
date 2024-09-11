import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/models/db';
import IncomeList from '@/models/incomes-list.model';
import mongoose from 'mongoose';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect(); // เชื่อมต่อกับฐานข้อมูล

  const { userId } = req.query;
  
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // ตรวจสอบว่า userId เป็น ObjectId ที่ถูกต้องหรือไม่
    if (!mongoose.Types.ObjectId.isValid(userId as string)) {
      return res.status(400).json({ message: 'Invalid userId format' });
    }

    // ค้นหาข้อมูลโดยใช้ฟิลด์ userId
    const userIncomeList = await IncomeList.findOne({ userId: userId });

    if (!userIncomeList) {
      return res.status(404).json({ message: 'Income list not found for this user' });
    }

    // ดึงข้อมูล items
    const itemsWithLabel = userIncomeList.items.map((item: any) => ({
      label: item.label,
      amount: item.amount || '', // ตรวจสอบว่ามีค่าหรือไม่
      comment: item.comment || '', // ตรวจสอบว่ามีค่าหรือไม่
    }));

    // ส่งข้อมูล items กลับไป (ไม่จำเป็นต้องมี name หากไม่ได้เชื่อมโยงโมเดล User)
    return res.status(200).json({ items: itemsWithLabel });

  } catch (error) {
    console.error('Error fetching user items:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
