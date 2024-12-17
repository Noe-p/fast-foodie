import { NextApiRequest, NextApiResponse } from 'next';
import { verifyApiKey } from '../../../middleware/verifyApiKey';
import { i18n } from 'next-i18next';
import { errorMessage } from '@/errors';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!i18n) {
    return res.status(500).json({ error: 'Internal server error' });
  }

  // Nous ne faisons rien côté serveur pour la déconnexion avec JWT, juste retourner un succès
  if (req.method === 'POST') {
    // Suppression du token côté client, en lui indiquant de ne plus l'envoyer
    // Par exemple, avec un cookie "token", tu peux le supprimer ici en envoyant un en-tête pour expirer ce cookie

    res.setHeader('Set-Cookie', 'token=; Max-Age=0; path=/; HttpOnly; SameSite=Strict');
    return res.status(200).json({ message: i18n.t(errorMessage.valid('logout').SUCCESS) });
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}

export default verifyApiKey(handler);
