import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { verifyApiKey } from '@/middleware/verifyApiKey';
import { i18n } from 'next-i18next';
import { errorMessage } from '@/errors';

const prisma = new PrismaClient();
const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if(!i18n) return res.status(500).json({ error: errorMessage.api('me').INTERNAL_SERVER_ERROR });
  if (req.method !== 'GET') {
    return res.status(405).json({ error:  i18n.t(errorMessage.api('method').NOT_ALLOWED) });
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: i18n.t(errorMessage.api('me').INVALID_FORMAT) });
  }

  const token = authHeader.split(' ')[1]; // Récupère le token après "Bearer"

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as { id: string };

    // Récupère les informations complètes de l'utilisateur depuis la base
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return res.status(404).json({ error: i18n.t(errorMessage.api('user').NOT_FOUND) });
    }

    // Exclut le mot de passe avant de retourner l'objet utilisateur
    const { password, ...userWithoutPassword } = user;

    return res.status(200).json({ user: userWithoutPassword });
  } catch (error) {
    return res.status(401).json({ error: i18n.t(errorMessage.api('token').INVALID) });
  }
}

export default verifyApiKey(handler);