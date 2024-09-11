// pages/api/logout.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/models/db';
import Session from '@/models/session.model';
import { serialize } from 'cookie';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'วิธีการไม่ได้รับอนุญาต' });
  }

  await dbConnect(); // เชื่อมต่อกับฐานข้อมูล

  const { sessionId } = req.cookies;

  if (!sessionId) {
    return res.status(400).json({ message: 'ไม่พบ sessionId' });
  }

  try {
    // ค้นหา session ในฐานข้อมูล
    const session = await Session.findOne({ sessionId });

    if (!session) {
      return res.status(404).json({ message: 'ไม่พบ Session' });
    }

    // ลบ session จากฐานข้อมูล
    await Session.deleteOne({ sessionId });

    // ลบ cookie
    const cookie = serialize('sessionId', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      path: '/',
      expires: new Date(0),
    });

    res.setHeader('Set-Cookie', cookie);

    return res.status(200).json({ message: 'ออกจากระบบสำเร็จ' });
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการออกจากระบบ:', error);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' });
  }
}
