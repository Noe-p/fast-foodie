import { DishStatus } from '@/types';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import { i18n } from 'next-i18next';
import { errorMessage } from '../../../errors';
import { verifyApiKey } from '../../../middleware/verifyApiKey';
import { dishValidation } from '../../../validations/dish';

const prisma = new PrismaClient();
const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!i18n) {
    return res.status(500).json({ error: errorMessage.api('dish').INTERNAL_SERVER_ERROR });
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: i18n.t(errorMessage.api('dish').INVALID_FORMAT) });
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

    if (req.method === 'GET') {
      const filters: any = {
        OR: [
          { 
            chefId: user.id, // Plats créés par l'utilisateur courant
          },
          {
            AND: [
              { 
                status: 'PUBLIC', // Seulement les plats publics
              },
              {
                chef: {
                  collaborators: {
                    some: { collaboratorId: user.id }, // Plats des collaborateurs
                  },
                },
              },
            ],
          },
        ],
      };

      const dishes = await prisma.dish.findMany({
        where: filters,
        include: {
          ingredients: {
            select: {
              id: true,
              quantity: true,
              food: {
                select: {
                  id: true,
                  name: true,
                  aisle: true,
                  icon: true,
                },
              },
            },
          },
          images: true,
          chef: true,
        },
      });

      return res.status(200).json(dishes);
    }

    if (req.method === 'POST') {
      try {
        await dishValidation.add.validate(req.body, { abortEarly: false });
      } catch (validationError: any) {
        return res.status(400).json({
          error: i18n.t(errorMessage.api('validation').VALIDATION),
          details: validationError.errors.map((error: string) => i18n?.t(error)),
        });
      }

      const { name, instructions, ingredients, tags, imageIds, weeklyDish, status } = req.body;

      if (!imageIds || !Array.isArray(imageIds) || imageIds.length === 0) {
        return res.status(400).json({
          error: i18n.t(errorMessage.api('image').INVALID),
        });
      }

      const NewIngredients = await Promise.all(
        ingredients.map(async (ingredient: { foodId: string }) => {
          const food = await prisma.food.findUnique({
            where: { id: ingredient.foodId },
          });

          if (!food) {
            if (!i18n) {
              return res.status(500).json({ error: errorMessage.api('food').INTERNAL_SERVER_ERROR });
            }
            return res.status(404).json({ error: i18n.t(errorMessage.api('food').NOT_FOUND) });
          }

          return ingredient;
        }),
      );

      const existingImages = await prisma.image.findMany({
        where: {
          id: { in: imageIds },
        },
      });

      if (existingImages.length !== imageIds.length) {
        return res.status(404).json({
          error: i18n.t(errorMessage.api('upload').NOT_FOUND),
        });
      }

      const newDish = await prisma.dish.create({
        data: {
          name,
          instructions,
          chefId: user.id,
          ingredients: {
            create: NewIngredients,
          },
          tags,
          images: {
            connect: imageIds.map((id: string) => ({ id })),
          },
          weeklyDish: weeklyDish ?? false, // Défaut à `false` si non fourni
          status: status ?? DishStatus.PUBLIC, // Défaut à `PRIVATE` si non fourni
        },
        include: {
          ingredients: {
            select: {
              id: true,
              quantity: true,
              food: {
                select: {
                  id: true,
                  name: true,
                  aisle: true,
                  icon: true,
                },
              },
            },
          },
          chef: {
            select: {
              id: true,
              userName: true,
              createdAt: true,
              updatedAt: true,
              password: false,
            },
          },
          images: true,
        },
      });

      const { chefId, ...dishWithoutChefId } = newDish;

      return res.status(201).json(dishWithoutChefId);
    }

    return res.status(405).json({ error: i18n.t(errorMessage.api('method').NOT_ALLOWED) });
  } catch (error: any) {
    return res.status(401).json({ error: i18n.t(errorMessage.api('token').INVALID), details: error.message });
  } finally {
    await prisma.$disconnect();
  }
}

export default verifyApiKey(handler);
