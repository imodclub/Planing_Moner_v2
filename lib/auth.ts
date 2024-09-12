import { NextApiRequest, NextApiResponse } from 'next';
import { verify,sign } from 'jsonwebtoken';
import { parse, serialize } from 'cookie';

const TOKEN_NAME = 'auth_token';
const MAX_AGE = 60 * 60 * 8; // 8 hours

export function setAuthCookie(res: NextApiResponse, userId: string) {
  // สร้าง JWT token
  const token = sign({ userId }, process.env.JWT_SECRET!, {
    expiresIn: MAX_AGE, // Token จะหมดอายุใน 8 ชั่วโมง
  });

  // ตั้งค่า Cookie สำหรับ token
  const cookie = serialize(TOKEN_NAME, token, {
    httpOnly: true, // ป้องกันการเข้าถึงจาก JavaScript ในฝั่ง Client
    secure: process.env.NODE_ENV === 'production', // ใช้เฉพาะใน production
    sameSite: 'strict', // ป้องกันการโจมตีประเภท CSRF
    maxAge: MAX_AGE, // อายุของ cookie
    path: '/', // ทำให้ cookie ใช้ได้ในทุกเส้นทาง
  });

  // ส่ง cookie กลับไปยัง client ผ่าน header
  res.setHeader('Set-Cookie', cookie);
}

export function parseCookies(req?: NextApiRequest) {
  if (req?.cookies) return req.cookies;

  const cookie =
    req?.headers?.cookie ||
    (typeof window !== 'undefined' ? document.cookie : '');
  return parse(cookie || '');
}

export function getAuthToken(req?: NextApiRequest) {
  const cookies = parseCookies(req);
  return cookies[TOKEN_NAME];
}

export async function verifyAuth(req?: NextApiRequest) {
  if (typeof window !== 'undefined') {
    // Client-side
    // ส่ง request ไปยัง API endpoint เพื่อตรวจสอบ token
    const response = await fetch('/api/verify-auth');
    if (!response.ok) {
      throw new Error('Authentication failed');
    }
    return await response.json();
  } else {
    // Server-side
    const token = req?.cookies[TOKEN_NAME];
    if (!token) {
      throw new Error('Missing auth token');
    }
    try {
      const decoded = verify(token, process.env.JWT_SECRET!);
      return decoded as { userId: string };
    } catch (error) {
      throw new Error('Invalid auth token');
    }
  }
}

