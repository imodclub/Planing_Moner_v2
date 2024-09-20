import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/models/db';
import User from '@/models/user.model'; // สมมติว่าคุณมี User model

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: 'userId is required' });
  }

  try {
    await dbConnect();
    const user = await User.findById(userId).select('name');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ name: user.name });
  } catch (error) {
    console.error('Error fetching user name:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}