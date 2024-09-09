// pages/api/expense-data/[userId].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/models/db';
import User from '@/models/user.model';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect(); // เชื่อมต่อกับฐานข้อมูล

  const { userId } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // ค้นหาผู้ใช้โดยใช้ userId
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // ส่งค่าชื่อ (name) ของผู้ใช้กลับไป
    return res.status(200).json({ name: user.name });
  } catch (error) {
    console.error('Error fetching user name:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}