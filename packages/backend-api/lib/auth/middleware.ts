import { VercelRequest } from '@vercel/node';
import { verifyJWT, JWTPayload } from './jwt';

export async function verifyAuth(req: VercelRequest): Promise<JWTPayload> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid authorization header');
  }

  const token = authHeader.substring(7);

  try {
    const payload = verifyJWT(token);
    return payload;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

export function getAuthToken(req: VercelRequest): string | null {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.substring(7);
}
