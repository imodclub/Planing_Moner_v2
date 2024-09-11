import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/models/db';
import IncomeList from '@/models/incomes-list.model';
import mongoose from 'mongoose';

// กำหนด interface สำหรับ item ใน userIncomeList
interface IncomeItem {
  label: string;
  amount?: number | string;
  comment?: string;
}

// กำหนด type สำหรับ itemsWithLabel
type ItemWithLabel = {
  label: string;
  amount: number | string;
  comment: string;
};

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

    // ค้นหาข้อมูลล่าสุดโดยใช้ฟิลด์ userId
    const latestIncomeList = await IncomeList.findOne({ userId: userId })
      .sort({ _id: -1 }) // เรียงลำดับตาม _id จากใหม่ไปเก่า
      .select('items createdAt _id'); // เลือกเฉพาะฟิลด์ที่ต้องการ


    if (!latestIncomeList) {
      return res.status(404).json({ message: 'Income list not found for this user' });
    }

    // ดึงข้อมูล items
    const itemsWithLabel: ItemWithLabel[] = latestIncomeList.items.map((item: IncomeItem) => ({
      label: item.label,
      amount:  '',
      comment: item.comment ?? '', // ใช้ nullish coalescing operator
    }));

    // ส่งข้อมูล items กลับไป
    return res.status(200).json({ 
      items: itemsWithLabel,
      createdAt: latestIncomeList.createdAt,
      _id: latestIncomeList._id
    });

  } catch (error) {
    console.error('Error fetching user items:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}