// pages/api/sign-in.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/models/db';
import User from '@/models/user.model';
import Session from '@/models/session.model';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method === 'POST') {
    const { email, password } = req.body;

    try {
      // ค้นหาผู้ใช้ในฐานข้อมูล
      const user = await User.findOne({ email });

      if (!user || !user.password) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // ตรวจสอบรหัสผ่าน
      const isPasswordValid  = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // สร้าง session ใหม่
      const sessionId = uuidv4();
      const sessionData = { userId: user._id };

      await Session.create({ sessionId, data: sessionData });

      res.status(200).json({ message: 'Sign-in successful', sessionId });
    } catch (error) {
      res.status(500).json({ error: 'Failed to sign in' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}