// src/pages/api/test-db.ts
import { verifyApiKey } from '@/middleware/verifyApiKey';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Test simple pour voir si la connexion fonctionne
    const users = await prisma.user.findMany();
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ error: 'Database connection failed' });
  } finally {
    await prisma.$disconnect();
  }
}

export default verifyApiKey(handler);