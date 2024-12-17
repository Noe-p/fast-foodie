import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { verifyApiKey } from '../../../middleware/verifyApiKey';
import { i18n } from 'next-i18next';
import { errorMessage } from '../../../errors';
import { foodValidation } from '../../../validations/food';

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

    const { id } = req.query;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({ error: i18n.t(errorMessage.api('food').NOT_FOUND) });
    }

    if (req.method === 'GET') {
      const food = await prisma.food.findUnique({
        where: { id },
      });

      if (!food) {
        return res.status(404).json({ error: i18n.t(errorMessage.api('food').NOT_FOUND) });
      }

      return res.status(200).json(food);
    }

    if (req.method === 'PATCH') {
      try {
        await foodValidation.update.validate(req.body, { abortEarly: false });
      } catch (validationError: any) {
        return res.status(400).json({
          error: i18n.t(errorMessage.api('validation').VALIDATION),
          details: validationError.errors.map((error: string) => i18n?.t(error)),
        });
      }

      const { name, aisle, icon } = req.body;

      const food = await prisma.food.findUnique({
        where: { id },
      });

      if (!food) {
        return res.status(404).json({ error: i18n.t(errorMessage.api('food').NOT_FOUND) });
      }

      const updatedFood = await prisma.food.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(aisle && { aisle }),
          ...(icon && { icon }),
        },
      });

      return res.status(200).json({
        message: i18n.t(errorMessage.valid('food').UPDATED_SUCCESS),
        food: updatedFood,
      });
    }

    if (req.method === 'DELETE') {
      const dish = await prisma.dish.findUnique({
        where: { id },
      });

      if (!dish) {
        return res.status(404).json({ error: i18n.t(errorMessage.api('dish').NOT_FOUND) });
      }

      // Vérifier si l'utilisateur courant est le chef du plat
      if (dish.chefId !== user.id) {
        return res.status(403).json({ 
          error: i18n.t(errorMessage.api('dish').NOT_ADMIN),
        });
      }

      // Supprimer le plat
      await prisma.dish.delete({
        where: { id },
      });

      return res.status(200).json({
        message: i18n.t(errorMessage.valid('dish').DELETED_SUCCESS),
      });
    }


    return res.status(405).json({ error: i18n.t(errorMessage.api('method').NOT_ALLOWED) });
  } catch (error: any) {
    return res.status(401).json({ error: i18n.t(errorMessage.api('token').INVALID), details: error.message });
  } finally {
    await prisma.$disconnect();
  }
}

export default verifyApiKey(handler);
