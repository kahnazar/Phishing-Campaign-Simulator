import { createHmac, timingSafeEqual } from 'node:crypto';

const TOKEN_EXPIRY_MS = Number(process.env.JWT_EXPIRY_MS ?? 12 * 60 * 60 * 1000);
const JWT_SECRET = process.env.JWT_SECRET ?? 'phishlab-dev-secret';

type TokenPayload = Record<string, unknown> & {
  sub: string;
  role: string;
  email: string;
  name: string;
  iat?: number;
  exp?: number;
};

export function createToken(payload: TokenPayload): string {
  const issuedAt = Date.now();
  const body = {
    ...payload,
    iat: issuedAt,
    exp: issuedAt + TOKEN_EXPIRY_MS,
  };

  const headerSegment = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payloadSegment = Buffer.from(JSON.stringify(body)).toString('base64url');
  const signature = createHmac('sha256', JWT_SECRET)
    .update(`${headerSegment}.${payloadSegment}`)
    .digest('base64url');

  return `${headerSegment}.${payloadSegment}.${signature}`;
}

export function verifyToken(token: string): TokenPayload {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid token format');
  }

  const [headerSegment, payloadSegment, signature] = parts;
  const expectedSignature = createHmac('sha256', JWT_SECRET)
    .update(`${headerSegment}.${payloadSegment}`)
    .digest('base64url');

  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (signatureBuffer.length !== expectedBuffer.length || !timingSafeEqual(signatureBuffer, expectedBuffer)) {
    throw new Error('Invalid token signature');
  }

  const payload = JSON.parse(Buffer.from(payloadSegment, 'base64url').toString('utf-8')) as TokenPayload;
  if (payload.exp && Date.now() > payload.exp) {
    throw new Error('Token expired');
  }

  return payload;
}
