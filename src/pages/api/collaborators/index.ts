import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import { i18n } from 'next-i18next';
import { errorMessage } from '../../../errors';
import { verifyApiKey } from '../../../middleware/verifyApiKey';
import { collaboratorsValidation } from '../../../validations/collaborators';

const prisma = new PrismaClient();
const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!i18n) return res.status(500).json({ error: errorMessage.api('collaborator').INTERNAL_SERVER_ERROR });

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: i18n.t(errorMessage.api('collaborator').INVALID_FORMAT) });
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
        await collaboratorsValidation.add.validate(req.body, { abortEarly: false });
      } catch (validationError: any) {
        return res.status(400).json({
          error: i18n.t(errorMessage.api('validation').VALIDATION),
          details: validationError.errors.map((error: string) => i18n?.t(error)),
        });
      }

      const { userName } = req.body;

      const collaborator = await prisma.user.findUnique({ where: { userName: userName } });
      if (!collaborator) {
        return res.status(404).json({ error: i18n.t(errorMessage.api('collaborator').NOT_FOUND) });
      }

      const existingCollaborator = await prisma.collaborator.findFirst({
        where: {
          userId: user.id,
          collaboratorId: collaborator.id,
        },
      });

      if (existingCollaborator) {
        return res.status(400).json({ error: i18n.t(errorMessage.api('collaborator').ALREADY_ADDED) });
      }

      // Création de la relation bidirectionnelle
      await prisma.collaborator.create({
        data: {
          userId: user.id,
          collaboratorId: collaborator.id,
        },
      });

      // Créer également l'entrée inverse pour le collaborateur
      await prisma.collaborator.create({
        data: {
          userId: collaborator.id,
          collaboratorId: user.id,
        },
      });

      return res.status(201).json({ message: i18n.t(errorMessage.valid('collaborator').ADDED_SUCCESS) });
    }

    if (req.method === 'GET') {
      const collaborators = await prisma.collaborator.findMany({
       where: { userId: user.id },
        include: {
          collaborator: {
            select: { // Sélectionner uniquement les champs nécessaires
              id: true,
              userName: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      });

      return res.status(200).json(collaborators.map((collaborator) => collaborator.collaborator));
    }

    return res.status(405).json({ error: i18n.t(errorMessage.api('method').NOT_ALLOWED) });
  } catch (error: any) {
      return res.status(401).json({ error: i18n.t(errorMessage.api('token').INVALID), details: error.message });
  } finally {
    await prisma.$disconnect();
  }
}

export default verifyApiKey(handler);
