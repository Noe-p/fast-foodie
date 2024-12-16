import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { verifyApiKey } from '../../../middleware/verifyApiKey';
import { i18n } from 'next-i18next';
import { errorMessage } from '../../../errors';
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

    if (req.method === 'POST') {
      try {
        await dishValidation.add.validate(req.body, { abortEarly: false });
      } catch (validationError: any) {
        return res.status(400).json({
          error: i18n.t(errorMessage.api('validation').VALIDATION),
          details: validationError.errors.map((error: string) => i18n?.t(error)),
        });
      }

      const { name, description, instructions, ingredients, tags, imageIds } = req.body;

      // Vérifier si imageIds est défini et n'est pas vide
      if (!imageIds || !Array.isArray(imageIds) || imageIds.length === 0) {
        return res.status(400).json({
          error: i18n.t(errorMessage.api('image').INVALID),
          details: "Image IDs are required and should be a non-empty array.",
        });
      }

      // Validation et création des ingrédients
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

      // Vérification des imageIds dans la base de données
      const existingImages = await prisma.image.findMany({
        where: {
          id: { in: imageIds }, // Vérifie que les IDs des images sont valides
        },
      });

      // Si certains imageIds n'existent pas
      if (existingImages.length !== imageIds.length) {
        return res.status(404).json({
          error: i18n.t(errorMessage.api('upload').NOT_FOUND),
        });
      }

      // Création du plat avec les ingrédients, tags et images
      const newDish = await prisma.dish.create({
        data: {
          name,
          description,
          instructions,
          chefId: user.id, // Le chef est l'utilisateur qui a créé le plat
          ingredients: {
            create: NewIngredients,
          },
          tags,
          images: {
            connect: imageIds.map((id: string) => ({ id })), // Connecte les images par leur ID sans utiliser 'dishId'
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
          images: true, // Inclure les images avec toutes leurs propriétés
        },
      });

      // Exclure chefId de la réponse avant de la renvoyer
      const { chefId, ...dishWithoutChefId } = newDish;
      
      // Reformater les tags pour qu'ils soient des chaînes de caractères
      const dishWithTagsAsStrings = {
        ...dishWithoutChefId,
        tags: newDish.tags, // Les tags sont déjà des chaînes de caractères
      };

      return res.status(201).json({
        message: i18n.t(errorMessage.valid('dish').ADDED_SUCCESS),
        dish: dishWithTagsAsStrings,
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
