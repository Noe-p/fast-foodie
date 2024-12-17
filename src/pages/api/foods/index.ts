import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { verifyApiKey } from '../../../middleware/verifyApiKey';
import { i18n } from 'next-i18next';
import { errorMessage } from '../../../errors';
import { foodValidation } from '../../../validations/food';
import { getFoodIcon } from '@/services/getFoodIcon';

const prisma = new PrismaClient();
const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!i18n) {
    return res.status(500).json({ error: errorMessage.api('food').INTERNAL_SERVER_ERROR });
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: i18n.t(errorMessage.api('food').INVALID_FORMAT) });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as { id: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return res.status(404).json({ error: i18n.t(errorMessage.api('user').NOT_FOUND) });
    }

    if (req.method === 'POST') {
      try {
        await foodValidation.create.validate(req.body, { abortEarly: false });
      } catch (validationError: any) {
        return res.status(400).json({
          error: i18n.t(errorMessage.api('validation').VALIDATION),
          details: validationError.errors.map((error: string) => i18n?.t(error)),
        });
      }

      const { name, aisle } = req.body;

      // Auto-generate an icon based on the name (basic example)
      const icon = getFoodIcon(name);

      const newFood = await prisma.food.create({
        data: {
          name,
          aisle,
          icon,
          userId: user.id,
        },
      });

      return res.status(201).json(newFood);
    }

    if (req.method === 'GET') {
      const foods = await prisma.food.findMany(
        {
          where: {
            userId: user.id,
          },
        },
      );
      return res.status(200).json({ foods });
    }

    return res.status(405).json({ error: i18n.t(errorMessage.api('method').NOT_ALLOWED) });
  } catch (error: any) {
    return res.status(401).json({ error: i18n.t(errorMessage.api('token').INVALID), details: error.message });
  } finally {
    await prisma.$disconnect();
  }
}

export default verifyApiKey(handler);
