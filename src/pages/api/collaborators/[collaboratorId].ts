import { NextApiRequest, NextApiResponse } from "next";
import { i18n } from "next-i18next";
import { errorMessage } from "../../../errors";
import { verifyApiKey } from "../../../middleware/verifyApiKey";
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!i18n) return res.status(500).json({ error: errorMessage.api('collaborator').INTERNAL_SERVER_ERROR });
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: i18n.t(errorMessage.api('method').NOT_ALLOWED) });
  }

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

    const { collaboratorId } = req.query;

    const collaborator = await prisma.collaborator.findFirst({
      where: {
        userId: user.id,
        id: String(collaboratorId),
      },
    });

    if (!collaborator) {
      return res.status(404).json({ error: i18n.t(errorMessage.api('collaborator').NOT_FOUND) });
    }

    await prisma.collaborator.delete({ where: { id: collaborator.id } });

    return res.status(200).json({ message: i18n.t(errorMessage.valid('collaborator').DELETED_SUCCESS) });
  } catch (error) {
    return res.status(401).json({ error: i18n.t(errorMessage.api('token').INVALID) });
  }
}

export default verifyApiKey(handler);
