import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication token not provided' });
  }

  const token = authHeader.split(' ')[1]; // Récupère le token après "Bearer"

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as { id: string };

    // Récupère les informations complètes de l'utilisateur depuis la base
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Exclut le mot de passe avant de retourner l'objet utilisateur
    const { password, ...userWithoutPassword } = user;

    return res.status(200).json({ user: userWithoutPassword });
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}
