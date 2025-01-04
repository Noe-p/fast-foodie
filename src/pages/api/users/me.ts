import { userValidation } from '@/validations';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import { i18n } from 'next-i18next';
import { errorMessage } from '../../../errors';
import { verifyApiKey } from '../../../middleware/verifyApiKey';

const prisma = new PrismaClient();
const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!i18n) {
    return res
      .status(500)
      .json({ error: errorMessage.api('user').INTERNAL_SERVER_ERROR });
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res
      .status(401)
      .json({ error: i18n.t(errorMessage.api('user').INVALID_FORMAT) });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as { id: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return res
        .status(404)
        .json({ error: i18n.t(errorMessage.api('user').NOT_FOUND) });
    }

    if (req.method === 'GET') {
      const { password, ...userWithoutPassword } = user;
      return res.status(200).json(userWithoutPassword);
    }

    if (req.method === 'PATCH') {
      // Validation des données avec Yup
      try {
        await userValidation.update.validate(req.body, { abortEarly: false });
      } catch (validationError: any) {
        return res.status(400).json({
          error: i18n.t(errorMessage.api('validation').VALIDATION),
          details: validationError.errors.map((error: string) => i18n?.t(error)),
        });
      }

      const { userName } = req.body;

      if (await prisma.user.findFirst({ where: { userName, id: { not: user.id } } })) {
        return res.status(400).json({
          error: i18n.t(errorMessage.api('user').EXIST),
        });
      }

      // Vérification de l'unicité du userName
      if (
        userName &&
        (await prisma.user.findFirst({
          where: { userName, id: { not: user.id } }, // Exclut l'utilisateur actuel
        }))
      ) {
        return res.status(400).json({
          error: i18n.t(errorMessage.api('user').EXIST),
        });
      }

      // Mise à jour des données
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          ...(userName && { userName }),
        },
      });

      const { password, ...userWithoutPassword } = updatedUser;

      return res.status(200).json({
        message: i18n.t(errorMessage.valid('user').UPDATED_SUCCESS),
        user: userWithoutPassword,
      });
    }

    if (req.method === 'DELETE') {
      await prisma.user.delete({
        where: { id: user.id },
      });

      return res.status(200).json({
        message: i18n.t(errorMessage.valid('user').DELETED_SUCCESS),
      });
    }

    return res
      .status(405)
      .json({ error: i18n.t(errorMessage.api('method').NOT_ALLOWED) });
  } catch (error: any) {
    console.error('Error:', error);
    return res.status(401).json({
      error: i18n.t(errorMessage.api('token').INVALID),
      details: error.message,
    });
  } finally {
    await prisma.$disconnect();
  }
}

export default verifyApiKey(handler);
