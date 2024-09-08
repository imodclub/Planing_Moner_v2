import type { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from "@/models/db";
import Session from "@/models/session.model";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method === 'POST') {
    const { sessionId } = req.body;

    try {
      await Session.deleteOne({ sessionId });
      res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to logout' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}