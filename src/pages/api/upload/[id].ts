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

    if (req.method === 'DELETE') {
      // Trouver l'image associée à ce plat et l'image à supprimer
      const imageToDelete = await prisma.image.findUnique({
        where: { id },
      });
      console.log('[D] [id]', id);

      if (!imageToDelete) {
        return res.status(404).json({ error: i18n.t(errorMessage.api('upload').NOT_FOUND) });
      }

      // Supprimer le fichier image physique du disque
      deleteImageFromDisk(imageToDelete.url);

      // Supprimer l'image de la base de données
      await prisma.image.delete({
        where: { id },
      });

      return res.status(200).json({
        message: i18n.t(errorMessage.valid('upload').DELETED_SUCCESS),
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
