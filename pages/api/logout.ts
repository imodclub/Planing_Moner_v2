// pages/api/logout.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'วิธีการไม่ได้รับอนุญาต' });
  }

  try {
    // ลบ cookie ทั้งหมดที่เกี่ยวข้อง
    const cookies = req.cookies;
    const clearedCookies = Object.keys(cookies).map((cookieName) =>
      serialize(cookieName, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        path: '/',
        expires: new Date(0),
      })
    );

    res.setHeader('Set-Cookie', clearedCookies);

    return res.status(200).json({ message: 'ออกจากระบบสำเร็จ' });
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการออกจากระบบ:', error);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' });
  }
}
