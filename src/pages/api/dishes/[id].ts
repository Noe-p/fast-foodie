import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { verifyApiKey } from '../../../middleware/verifyApiKey';
import { i18n } from 'next-i18next';
import { errorMessage } from '../../../errors';
import { foodValidation } from '../../../validations/food';
import { dishValidation } from '@/validations/dish';

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
      const dish = await prisma.dish.findUnique({
        where: { id },
        include: {
          ingredients: {
            select: {
              id: true,
              quantity: true,
              food: true, // Inclure l'objet Food
            },
          },
          chef: {
            select: {
              id: true,
              userName: true,
              email: true,
              role: true,
              createdAt: true,
              updatedAt: true,
              password: false,
            },
          },
          images: true, // Inclure les images du plat
        },
      });

      if (!dish) {
        return res.status(404).json({ error: i18n.t(errorMessage.api('dish').NOT_FOUND) });
      }

      // Supprimer le champ chefId de la réponse
      const { chefId, ...dishWithoutChefId } = dish;
      return res.status(200).json(dishWithoutChefId);
    }

    if (req.method === 'PATCH') {
      try {
        await dishValidation.update.validate(req.body, { abortEarly: false });
      } catch (validationError: any) {
        return res.status(400).json({
          error: i18n.t(errorMessage.api('validation').VALIDATION),
          details: validationError.errors.map((error: string) => i18n?.t(error)),
        });
      }

      const { name, description, instructions, ingredients, tags, imageUrls } = req.body;

      const dish = await prisma.dish.findUnique({
        where: { id },
      });

      if (!dish) {
        return res.status(404).json({ error: i18n.t(errorMessage.api('dish').NOT_FOUND) });
      }

      // Réinitialisation des ingrédients : suppression de tous les anciens ingrédients
      await prisma.ingredient.deleteMany({
        where: { dishId: id },
      });

      // Ajout des nouveaux ingrédients
      const updatedIngredients = ingredients ? await Promise.all(
        ingredients.map(async (ingredient: { foodId: string; quantity: string }) => {
          const food = await prisma.food.findUnique({
            where: { id: ingredient.foodId },
          });

          if (!food) {
            if(!i18n) return res.status(500).json({ error: errorMessage.api('dish').INTERNAL_SERVER_ERROR });
            return res.status(404).json({ error: i18n.t(errorMessage.api('food').NOT_FOUND) });
          }

          return {
            foodId: ingredient.foodId,
            quantity: ingredient.quantity,
          };
        })
      ) : [];

      // Mise à jour du plat avec les nouveaux ingrédients
      const updatedDish = await prisma.dish.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(description && { description }),
          ...(instructions && { instructions }),
          ...(tags && { tags }),  // Mettre à jour les tags
          images: {
            create: imageUrls?.map((url: string) => ({ url })), // Ajouter les nouvelles images
          },
          ingredients: {
            create: updatedIngredients,
          },
        },
        include: {
          ingredients: {
            select: {
              id: true,
              quantity: true,
              food: true,
            },
          },
          chef: {
            select: {
              id: true,
              userName: true,
              email: true,
              role: true,
              createdAt: true,
              updatedAt: true,
              password: false,
            },
          },
          images: true, // Inclure les images mises à jour
        },
      });

      return res.status(200).json({
        message: i18n.t(errorMessage.valid('dish').UPDATED_SUCCESS),
        dish: updatedDish,
      });
    }

    if (req.method === 'DELETE') {
      const dish = await prisma.dish.findUnique({
        where: { id },
      });

      if (!dish) {
        return res.status(404).json({ error: i18n.t(errorMessage.api('dish').NOT_FOUND) });
      }

      // Supprimer les images associées
      await prisma.image.deleteMany({
        where: { dishId: id },
      });

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