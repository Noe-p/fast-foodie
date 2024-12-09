import { userValidation } from '../../../validations';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { errorMessage } from '../../../errors';
import { UserRole } from '../../../types'
import { i18n } from 'next-i18next';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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

      const { email, password, userName } = req.body;

      // Vérifier si l'utilisateur existe déjà
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });
      if (existingUser) {
        return res.status(409).json({ 
          error: i18n.t(errorMessage.api('user').ALREADY_CREATED),
        });
      }

      // Hacher le mot de passe
      const hashedPassword = await bcrypt.hash(password, 10);

      // Créer un nouvel utilisateur
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role: UserRole.USER,
          userName,
        },
      });

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


      return res.status(201).json({ 
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
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
