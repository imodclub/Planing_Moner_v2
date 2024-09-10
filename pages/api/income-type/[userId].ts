// pages/api/income-type/[userId].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/models/db';
import IncomeType from '@/models/incomes-type.model';
import mongoose from 'mongoose';

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

    // ค้นหาข้อมูลโดยใช้ userId
    const incomeTypes = await IncomeType.find({ userId });
    if (!incomeTypes || incomeTypes.length === 0) {
      return res.status(404).json({ message: 'Income types not found' });
    }

    // ส่งข้อมูล income types กลับไป
    return res.status(200).json(incomeTypes);
  } catch (error) {
    console.error('Error fetching income types:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}