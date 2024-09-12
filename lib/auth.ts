import { NextApiRequest, NextApiResponse } from 'next';
import { verify,sign } from 'jsonwebtoken';
import { parse, serialize } from 'cookie';

const TOKEN_NAME = 'auth_token';
const MAX_AGE = 60 * 60 * 8; // 8 hours

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

export function verifyAuth(req?: NextApiRequest) {
  let token;
  if (typeof window !== 'undefined') {
    // Client-side
    const cookies = parse(document.cookie);
    token = cookies[TOKEN_NAME];
  } else {
    // Server-side
    token = req?.cookies[TOKEN_NAME];
  }

  if (!token) throw new Error('Missing auth token');

  try {
    const decoded = verify(token, process.env.JWT_SECRET!);
    return decoded as { userId: string };
  } catch (e) {
    throw new Error('Invalid auth token');
  }
}

export function setAuthCookie(res: NextApiResponse, userId: string) {
  const token = sign({ userId }, process.env.JWT_SECRET!, {
    expiresIn: MAX_AGE,
  });
  const cookie = serialize(TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: MAX_AGE,
    path: '/',
  });

  res.setHeader('Set-Cookie', cookie);
}