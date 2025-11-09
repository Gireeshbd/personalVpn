import jwt from 'jsonwebtoken';

// JWT_SECRET is required for security - no fallback in production
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}
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
