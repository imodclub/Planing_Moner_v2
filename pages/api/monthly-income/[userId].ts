import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/models/db';
import mongoose from 'mongoose';
import Income from '@/models/incomes.model';
import { verifyAuth } from '@/lib/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await dbConnect();

  try {
    // ตรวจสอบการยืนยันตัวตนและรับ userId
    const user = await verifyAuth(req);
    const userId = user.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid userId format' });
    }

    // ดึงข้อมูลรายรับรายเดือน
    const monthlyIncomes = await Income.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId as string) } },
      { $unwind: '$items' },
      {
        $group: {
          _id: { $month: '$date' },
          total: { $sum: { $toDouble: '$items.amount' } },
        },
      },
      {
        $project: {
          _id: 0,
          month: {
            $let: {
              vars: {
                monthsInString: [
                  '',
                  'มกราคม',
                  'กุมภาพันธ์',
                  'มีนาคม',
                  'เมษายน',
                  'พฤษภาคม',
                  'มิถุนายน',
                  'กรกฎาคม',
                  'สิงหาคม',
                  'กันยายน',
                  'ตุลาคม',
                  'พฤศจิกายน',
                  'ธันวาคม',
                ],
              },
              in: { $arrayElemAt: ['$$monthsInString', '$_id'] },
            },
          },
          total: 1,
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json(monthlyIncomes);
  } catch (error) {
    console.error('Error fetching monthly incomes:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
