import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { verifyApiKey } from '../../../middleware/verifyApiKey';
import { i18n } from 'next-i18next';
import { errorMessage } from '../../../errors';

const prisma = new PrismaClient();
const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';

// Désactiver le bodyParser de Next.js
export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadDir = path.join(process.cwd(), 'public/files');

// Assure-toi que le dossier de destination existe
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!i18n) {
    return res.status(500).json({ error: errorMessage.api('upload').INTERNAL_SERVER_ERROR });
  }

  // Vérification du token dans l'en-tête Authorization
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: i18n.t(errorMessage.api('upload').INVALID_FORMAT) });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Décodage du token JWT
    const decoded = jwt.verify(token, SECRET_KEY) as { id: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return res.status(404).json({ error: i18n.t(errorMessage.api('user').NOT_FOUND) });
    }

    const form = new IncomingForm({
      uploadDir, // Dossier de destination des fichiers
      keepExtensions: true, // Conserver l'extension
      maxFileSize: 10 * 1024 * 1024, // Limite : 10 Mo
      multiples: true, // Accepter plusieurs fichiers
    });

    const fileData = await new Promise<{ fields: any; files: any }>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          return reject(err);
        }
        resolve({ fields, files });
      });
    });

    const uploadedFile = Array.isArray(fileData.files.file) ? fileData.files.file[0] : fileData.files.file;

    if (!uploadedFile) {
      throw new Error(i18n.t(errorMessage.api('upload').NOT_FOUND));
    }

    const uploadedFilePath = uploadedFile.filepath;
    if (!uploadedFilePath) {
      throw new Error(i18n.t(errorMessage.api('upload').UNDEFINED));
    }

    // Construis le chemin relatif pour le front-end
    const fileName = path.basename(uploadedFilePath);
    const filePath = `/files/${fileName}`;

    // Enregistrer l'image dans la base de données sans associer à un plat
    const image = await prisma.image.create({
      data: {
        filename: uploadedFile.originalFilename,
        url: filePath,
        size: uploadedFile.size,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return res.status(200).json({
      message: i18n.t(errorMessage.valid('upload').ADDED_SUCCESS),
      image,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return res.status(500).json({
      error: error.message || i18n.t(errorMessage.api('upload').INTERNAL_SERVER_ERROR),
    });
  } finally {
    await prisma.$disconnect();
  }
};

export default verifyApiKey(handler);
