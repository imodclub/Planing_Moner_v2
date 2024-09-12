// pages/api/login.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/models/db';
import User from '@/models/user.model';
import { setAuthCookie } from '@/lib/auth';
import bcrypt from 'bcrypt';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  await dbConnect();

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // ตรวจสอบรหัสผ่าน
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (isMatch) {
      setAuthCookie(res, user._id.toString());
      console.log('Auth cookie set for user:', user._id);
      return res.status(200).json({ message: 'Logged in successfully' });
    }

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
