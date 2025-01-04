import { DishStatus } from '@/types';
import { dishValidation } from '@/validations/dish';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import { i18n } from 'next-i18next';
import path from 'path';
import { errorMessage } from '../../../errors';
import { verifyApiKey } from '../../../middleware/verifyApiKey';

const prisma = new PrismaClient();
const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';

// Fonction de suppression du fichier physique du disque
const deleteImageFromDisk = (filePath: string) => {
  const fileFullPath = path.join(process.cwd(), 'public', filePath);

  if (fs.existsSync(fileFullPath)) {
    fs.unlinkSync(fileFullPath);
  } else {
    console.error('File not found:', fileFullPath);
  }
};

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
              food: true,
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

      if (!dish) {
        return res.status(404).json({ error: i18n.t(errorMessage.api('dish').NOT_FOUND) });
      }

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

      const { name, instructions, ingredients, tags, imageIds, weeklyDish, status } = req.body;

      const dish = await prisma.dish.findUnique({
        where: { id },
      });

      if (!dish) {
        return res.status(404).json({ error: i18n.t(errorMessage.api('dish').NOT_FOUND) });
      }

      // Suppression des ingrédients existants avant mise à jour
      await prisma.ingredient.deleteMany({
        where: { dishId: id },
      });

      const updatedIngredients = ingredients ? await Promise.all(
        ingredients.map(async (ingredient: { foodId: string; quantity: string }) => {
          const food = await prisma.food.findUnique({
            where: { id: ingredient.foodId },
          });

          if (!food) {
            if (!i18n) return res.status(500).json({ error: errorMessage.api('dish').INTERNAL_SERVER_ERROR });
            return res.status(404).json({ error: i18n.t(errorMessage.api('food').NOT_FOUND) });
          }

          return {
            foodId: ingredient.foodId,
            quantity: ingredient.quantity,
          };
        })
      ) : [];

      // Gérer les images si `imageIds` est fourni
      const imageUpdateData: any = {};
      if (imageIds) {
        // Récupérer les images existantes du plat
        const existingImages = await prisma.image.findMany({
          where: { dishId: id },
        });

        // Identifiants des images qui seront supprimées du disque
        const imagesToDeleteFromDisk = existingImages.filter(image => {
          return !imageIds.includes(image.id);  // Les images qui ne sont pas dans `imageIds`
        });

        // Supprimer les images du disque
        imagesToDeleteFromDisk.forEach(image => {
          deleteImageFromDisk(image.url);
        });

        imageUpdateData.images = {
          connect: imageIds.map((id: string) => ({ id })), // Connecte les images par leur ID
          deleteMany: { // Supprime les images qui ne sont pas dans `imageIds`
            id: {
              notIn: imageIds,
            },
          },
        };
      }

      // Mettre à jour le plat
      const updatedDish = await prisma.dish.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(instructions && { instructions }),
          ...(tags && { tags }),
          ...(status && { status: status ?? DishStatus.PUBLIC }),
          ...imageUpdateData,  // Mettre à jour les images si nécessaire
          weeklyDish: weeklyDish,
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
              createdAt: true,
              updatedAt: true,
              password: false,
            },
          },
          images: true,
        },
      });

      return res.status(200).json(updatedDish);
    }



    if (req.method === 'DELETE') {
      const dish = await prisma.dish.findUnique({
        where: { id },
      });

      if (!dish) {
        return res.status(404).json({ error: i18n.t(errorMessage.api('dish').NOT_FOUND) });
      }

      // Supprimer les images associées et leur fichier physique
      const imagesToDelete = await prisma.image.findMany({
        where: { dishId: id },
      });

      imagesToDelete.forEach(image => {
        deleteImageFromDisk(image.url);
      });

      await prisma.image.deleteMany({
        where: { dishId: id },
      });

      await prisma.dish.delete({
        where: { id },
      });

      const unusedImages = await prisma.image.findMany({
        where: { dishId: null },
      });

      if (unusedImages.length > 0) {
        unusedImages.forEach(image => {
          deleteImageFromDisk(image.url);
        });

        await prisma.image.deleteMany({
          where: { id: { in: unusedImages.map(image => image.id) } },
        });
      }

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
