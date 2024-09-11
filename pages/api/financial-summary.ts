// pages/api/financial-summary.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/models/db';
import Session from '@/models/session.model';
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

  const { sessionId } = req.cookies;

  if (!sessionId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const session = await Session.findOne({ sessionId });
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    const userId = session.data.userId;

    // ดึงข้อมูลรายรับ
    const incomeData = await Income.aggregate([
      { $match: { userId: userId } },
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
      { $match: { userId: userId } },
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
      { $match: { userId: userId } },
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
