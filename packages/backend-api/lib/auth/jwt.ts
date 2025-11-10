import jwt from 'jsonwebtoken';

// JWT_SECRET is required for security - no fallback in production
// Type assertion is safe here because we validate it exists
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  return secret;
}

const JWT_SECRET = getJwtSecret();
const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';

export interface JWTPayload {
  userId: string;
  anonymousId: string;
}

export function generateJWT(payload: JWTPayload): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY } as any);
}

export function verifyJWT(token: string): JWTPayload {
  const decoded = jwt.verify(token, JWT_SECRET);

  // Type guard to ensure decoded token has required properties
  if (
    typeof decoded === 'object' &&
    decoded !== null &&
    'userId' in decoded &&
    'anonymousId' in decoded
  ) {
    return decoded as JWTPayload;
  }

  throw new Error('Invalid token payload');
}
