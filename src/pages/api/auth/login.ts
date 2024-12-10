import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { authValidation } from '@/validations';
import { errorMessage } from '@/errors';
import { i18n } from 'next-i18next';
import {verifyApiKey} from '@/middleware/verifyApiKey';

const prisma = new PrismaClient();


async function handler(req: NextApiRequest, res: NextApiResponse) {
  if(!i18n) return 
  try {
    if (req.method === 'POST') {
      try {
        await authValidation.login.validate(req.body, { abortEarly: false });
      } catch (validationError: any) {
        return res.status(400).json({ 
          error: i18n.t(errorMessage.api('validation').VALIDATION), 
          details: validationError.errors.map((error: string)=> i18n?.t(error)) 
        });
      }

      const { email, password } = req.body;

      // Rechercher l'utilisateur dans la base de données
      const user = await prisma.user.findUnique({
        where: { email },
      });

      // Vérifier si l'utilisateur existe
      if (!user) {
        return res.status(401).json({ 
          error: i18n.t(errorMessage.api('user').NOT_FOUND_OR_WRONG_PASSWORD),
        });
      }

      // Vérifier le mot de passe
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ 
          error:  i18n.t(errorMessage.api('user').NOT_FOUND_OR_WRONG_PASSWORD),
        });
      }

      // Créer le token JWT
      const token = jwt.sign(
        { 
          id: user.id,
          email: user.email,
          role: user.role
        },
        process.env.JWT_SECRET!,
        { expiresIn: '90d' } 
      );

      return res.status(200).json({ 
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      error:  i18n.t(errorMessage.api('login').INTERNAL_SERVER_ERROR)
    });
  } finally {
    await prisma.$disconnect();
  }
}

export default verifyApiKey(handler);
