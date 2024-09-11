import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/models/db';
import ExpenseList from '@/models/expenses-list.model';
import mongoose from 'mongoose';

// กำหนด interface สำหรับ item ใน userExpenseList
interface ExpenseItem {
  label: string;
  amount?: number | string;
  comment?: string;
}

// กำหนด type สำหรับ itemsWithLabel
type ItemWithLabel = {
  label: string;
  amount: string; // เปลี่ยนเป็น string เท่านั้น
  comment: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect(); // เชื่อมต่อกับฐานข้อมูล

  const { userId } = req.query;

  // ตรวจสอบว่า userId เป็น ObjectId ที่ถูกต้องหรือไม่
  if (!mongoose.Types.ObjectId.isValid(userId as string)) {
    return res.status(400).json({ message: 'Invalid userId format' });
  }

  switch (req.method) {
    case 'GET':
      return handleGet(req, res, userId as string);
    case 'DELETE':
      return handleDelete(req, res, userId as string);
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    // ค้นหาข้อมูลล่าสุดโดยใช้ฟิลด์ userId
    const latestExpenseList = await ExpenseList.findOne({ userId })
      .sort({ _id: -1 }) // เรียงลำดับตาม _id จากใหม่ไปเก่า
      .select('items createdAt _id'); // เลือกเฉพาะฟิลด์ที่ต้องการ

    if (!latestExpenseList) {
      return res.status(404).json({ message: 'Expense list not found for this user' });
    }

    // ดึงข้อมูล items
    const itemsWithLabel: ItemWithLabel[] = latestExpenseList.items.map((item: ExpenseItem) => ({
      label: item.label,
      amount: '',
      comment: item.comment ?? '', // ใช้ nullish coalescing operator
    }));

    // ส่งข้อมูล items กลับไป
    return res.status(200).json({ 
      items: itemsWithLabel,
      createdAt: latestExpenseList.createdAt,
      _id: latestExpenseList._id
    });

  } catch (error) {
    console.error('Error fetching user items:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const { index } = req.body;

    // ค้นหา ExpenseList ล่าสุดของ user
    const latestExpenseList = await ExpenseList.findOne({ userId }).sort({ _id: -1 });

    if (!latestExpenseList) {
      return res.status(404).json({ message: 'Expense list not found for this user' });
    }

    // ตรวจสอบว่า index ที่ระบุอยู่ในช่วงที่ถูกต้อง
    if (index < 0 || index >= latestExpenseList.items.length) {
      return res.status(400).json({ message: 'Invalid item index' });
    }

    // ลบ item ที่ index ที่ระบุ
    latestExpenseList.items.splice(index, 1);

    // บันทึกการเปลี่ยนแปลง
    await latestExpenseList.save();

    return res.status(200).json({ message: 'Item deleted successfully' });

  } catch (error) {
    console.error('Error deleting item:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}