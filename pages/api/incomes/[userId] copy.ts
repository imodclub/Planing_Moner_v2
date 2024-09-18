import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/models/db';
import Income from '@/models/incomes.model';
import mongoose from 'mongoose';

interface IncomeItem {
  label: string;
  amount?: number | string;
  comment?: string;
}

const defaultIncomeItems: IncomeItem[] = [
  { label: 'เงินเดือน', amount: '', comment: '' },
  { label: 'เงินปันผล, โบนัส', amount: '', comment: '' },
  { label: 'รายได้เสริม', amount: '', comment: '' },
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();
  const { userId } = req.query;

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
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'รูปแบบ userId ไม่ถูกต้อง' });
    }

    const userIncomes = await Income.find({ userId: userId });
    if (!userIncomes || userIncomes.length === 0) {
      return res.status(200).json({ incomes: [{ date: new Date().toISOString().split('T')[0], items: defaultIncomeItems }] });
    }

    const formattedIncomes = userIncomes.map((income) => ({
      date: income.date,
      items: income.items.map((item: IncomeItem) => ({
        label: item.label,
        amount:  '',
        comment:  '',
      })),
    }));
    return res.status(200).json({ incomes: formattedIncomes });
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการดึงข้อมูลรายรับของผู้ใช้:', error);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' });
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const { date, items, timestamp } = req.body;
    console.log('ข้อมูลที่ได้รับ:', { date, items, timestamp });
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: 'ข้อมูลรายการไม่ถูกต้องหรือไม่มี' });
    }

    const newIncome = new Income({
      userId,
      date,
      timestamp,
      items: items.map(item => ({
        ...item,
        amount: item.amount ? parseFloat(item.amount) : 0
      }))
    });
    await newIncome.save();
    res.status(200).json({ message: 'บันทึกรายรับเรียบร้อยแล้ว' });
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการบันทึกรายรับ:', error);
    res.status(500).json({ error: 'ไม่สามารถบันทึกรายรับได้' });
  }
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    // ตรวจสอบว่ามี date ใน query params หรือไม่
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ message: 'ต้องระบุวันที่ที่ต้องการลบ' });
    }

    // ลบรายการรายรับตาม userId และ date
    const result = await Income.deleteOne({ userId, date });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'ไม่พบรายการรายรับที่ต้องการลบ' });
    }

    res.status(200).json({ message: 'ลบรายการรายรับเรียบร้อยแล้ว' });
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการลบรายการรายรับ:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' });
  }
}
