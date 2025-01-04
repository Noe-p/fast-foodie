import { verifyApiKey } from '@/middleware/verifyApiKey';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import { i18n } from 'next-i18next';
import { errorMessage } from '../../../errors';
import { userValidation } from '../../../validations';

const prisma = new PrismaClient();

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if(!i18n) return 
  try {
    if (req.method === 'POST') {
      try {
        await userValidation.create.validate(req.body, { abortEarly: false });
      } catch (validationError: any) {
        return res.status(400).json({ 
          error: i18n.t(errorMessage.api('validation').VALIDATION), 
          details: validationError.errors.map((error: string)=> i18n?.t(error)) 
        });
      }

      const { password, userName } = req.body;

      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { userName },
          ],
        },
      });

      if (existingUser) {
        if (existingUser.userName === userName) {
          return res.status(409).json({ 
            error: i18n.t(errorMessage.api('userName').ALREADY_CREATED), // Nouveau message pour userName
          });
        }
      }

      // Hacher le mot de passe
      const hashedPassword = await bcrypt.hash(password, 10);

      // Créer un nouvel utilisateur
      const user = await prisma.user.create({
        data: {
          password: hashedPassword,
          userName,
        },
      });

      // Créer le token JWT
      const token = jwt.sign(
        { 
          id: user.id,
          userName: user.userName,
        },
        process.env.JWT_SECRET!,
        { expiresIn: '90d' } 
      );


      return res.status(201).json({ 
        token,
        user: {
          id: user.id,
          userName: user.userName,
        }
      });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ 
      error:  i18n.t(errorMessage.api('register').INTERNAL_SERVER_ERROR)
    });
  } finally {
    await prisma.$disconnect();
  }
}

export default verifyApiKey(handler);