import { NextApiRequest, NextApiResponse } from 'next';
import multer from 'multer';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';

// Configuration de multer pour utiliser un stockage en disque
const storage = multer.diskStorage({
  destination: './public/files', // Le répertoire où les fichiers seront stockés
  filename: (req, file, callback) => {
    const fileExtName = extname(file.originalname);
    const randomName = uuid(); // Génère un nom unique pour chaque fichier
    callback(null, `${randomName}${fileExtName}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limite la taille du fichier à 10 Mo
  fileFilter: (req, file, callback) => {
    const allowedExtensions = /\.(jpg|jpeg|png|webp)$/;
    if (!allowedExtensions.test(file.originalname)) {
      return callback(new Error('Only images are allowed'));
    }
    callback(null, true);
  },
});

export const multerMiddleware = upload.single('file'); // Attends un fichier sous le champ 'file'

// Fonction pour exécuter le middleware multer dans Next.js
export const runMiddleware = (
  req: NextApiRequest,
  res: NextApiResponse,
  fn: Function
): Promise<void> => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};
