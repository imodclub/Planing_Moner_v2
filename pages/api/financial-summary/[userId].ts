// pages/api/financial-summary.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/models/db';
import mongoose from 'mongoose';
import Income from '@/models/incomes.model';
import Expense from '@/models/expenses.model';
import Saving from '@/models/savings.model';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await dbConnect();

  const { userId } = req.query;

  // ตรวจสอบว่า userId เป็น ObjectId ที่ถูกต้องหรือไม่
  if (!mongoose.Types.ObjectId.isValid(userId as string)) {
    return res.status(400).json({ message: 'Invalid userId format' });
  }

  try {
    // ดึงข้อมูลรายรับ
    const incomeData = await Income.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId as string) } },
      { $unwind: '$items' },
      {
        $group: {
          _id: { $month: '$date' },
          total: { $sum: { $toDouble: '$items.amount' } },
        },
      },
    ]);

    // ดึงข้อมูลรายจ่าย
    const expenseData = await Expense.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId as string) } },
      { $unwind: '$items' },
      {
        $group: {
          _id: { $month: '$date' },
          total: { $sum: { $toDouble: '$items.amount' } },
        },
      },
    ]);

    // ดึงข้อมูลเงินออม
    const savingsData = await Saving.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId as string) } },
      { $unwind: '$items' },
      {
        $group: {
          _id: { $month: '$date' },
          total: { $sum: { $toDouble: '$items.amount' } },
        },
      },
    ]);

    // แปลงข้อมูลให้อยู่ในรูปแบบที่เหมาะสมสำหรับแผนภูมิ
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const formatData = (data: { _id: number; total: number }[]) => {
      return months.map((month) => {
        const entry = data.find((item) => item._id === month);
        return entry ? entry.total : 0;
      });
    };

    const summary = {
      income: formatData(incomeData),
      expenses: formatData(expenseData),
      savings: formatData(savingsData),
    };

    res.status(200).json(summary);
  } catch (error) {
    console.error('Error fetching financial summary:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
