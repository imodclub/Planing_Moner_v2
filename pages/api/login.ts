// ชื่อไฟล์: pages/api/login.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { sign } from 'jsonwebtoken';
import { compare } from 'bcrypt';
import dbConnect from '@/models/db'; // สมมติว่าคุณมีฟังก์ชันนี้สำหรับเชื่อมต่อกับฐานข้อมูล

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, password } = req.body;

  try {
    const db = await dbConnect();
    const collection = db.collection('users');

    const user = await collection.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isPasswordValid = await compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Logged in successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name, // เพิ่มข้อมูลผู้ใช้อื่นๆ ตามที่คุณต้องการ
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
