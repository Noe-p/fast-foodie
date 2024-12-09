// src/pages/api/test-db.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
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
