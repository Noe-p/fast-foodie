import { errorMessage } from '@/errors';
import { NextApiRequest, NextApiResponse } from 'next';
import { i18n } from 'next-i18next';

export function verifyApiKey(handler: Function) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const apiKey = req.headers['x-api-key'];
    if(!i18n) return
    if (!apiKey) {
      return res.status(401).json({ error:  i18n.t(errorMessage.api('apiKey').NOT_FOUND) });
    }

    if (apiKey !== process.env.NEXT_PUBLIC_API_KEY) {
      return res.status(403).json({ error: i18n.t(errorMessage.api('apiKey').INVALID )});
    }

    return handler(req, res);
  };
}
