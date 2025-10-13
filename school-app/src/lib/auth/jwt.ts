import jwt from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;

// Default expiration times
const ACCESS_TOKEN_EXP = "15m"; // 15 minutes
const REFRESH_TOKEN_EXP = "7d"; // 7 days



// Payload interface — simplified
export interface JWTPayload {
  userId: string;
  role: string;
}

// ------------------------
// SIGN ACCESS TOKEN
// ------------------------
export function signAccessToken(payload: JWTPayload) {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXP,
  });
}

export function signRefreshToken(payload: object) {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES });
}

// ------------------------
// VERIFY ACCESS TOKEN
// ------------------------
export function verifyAccessToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, ACCESS_TOKEN_SECRET) as JWTPayload;
  } catch {
    throw new Error("Invalid access token");
  }
}

// ------------------------
// VERIFY REFRESH TOKEN
// ------------------------
export function verifyRefreshToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, REFRESH_TOKEN_SECRET) as JWTPayload;
  } catch {
    throw new Error("Invalid refresh token");
  }
}

// ------------------------
// Rotate refresh token
// ------------------------
export function rotateRefreshToken(oldToken: string) {
  const payload = verifyRefreshToken(oldToken);
  return signRefreshToken(payload);
}
