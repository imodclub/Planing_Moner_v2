import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/models/db';
import mongoose from 'mongoose';
import Income from '@/models/incomes.model';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await dbConnect();

  try {
    const { userId } = req.query;
    if (!userId || Array.isArray(userId)) {
      return res.status(400).json({ message: 'Invalid userId' });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid userId format' });
    }

    const monthlyIncomes = await Income.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $unwind: '$items' },
      {
        $group: {
          _id: {
            month: { $month: '$date' },
            label: '$items.label'
          },
          total: { $sum: { $toDouble: '$items.amount' } },
        },
      },
      {
        $match: {
          total: { $gt: 0 } // กรองเฉพาะรายการที่มียอดมากกว่า 0
        }
      },
      {
        $group: {
          _id: '$_id.month',
          items: {
            $push: {
              label: '$_id.label',
              amount: { $round: ['$total', 0] } // ปัดเศษให้เป็นจำนวนเต็ม
            }
          },
          total: { $sum: '$total' }
        }
      },
      {
        $project: {
          _id: 0,
          month: {
            $let: {
              vars: {
                monthsInString: [
                  '',
                  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
                  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
                ],
              },
              in: { $arrayElemAt: ['$$monthsInString', '$_id'] },
            },
          },
          items: 1,
          total: { $round: ['$total', 0] } // ปัดเศษยอดรวมให้เป็นจำนวนเต็ม
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