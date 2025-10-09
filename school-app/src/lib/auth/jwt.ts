import jwt from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;

// Default expiration times
const ACCESS_TOKEN_EXP = "15m"; // 15 minutes
const REFRESH_TOKEN_EXP = "7d"; // 7 days

// Payload interface
export interface JWTPayload {
  userId: string;
  role: string;
  schoolId: string;
}

// ------------------------
// SIGN ACCESS TOKEN
// ------------------------
export function signAccessToken(payload: JWTPayload) {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXP,
  });
}

// ------------------------
// SIGN REFRESH TOKEN
// ------------------------
export function signRefreshToken(payload: JWTPayload) {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXP,
  });
}

// ------------------------
// VERIFY ACCESS TOKEN
// ------------------------
export function verifyAccessToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, ACCESS_TOKEN_SECRET) as JWTPayload;
  } catch (err) {
    throw new Error("Invalid access token");
  }
}

// ------------------------
// VERIFY REFRESH TOKEN
// ------------------------
export function verifyRefreshToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, REFRESH_TOKEN_SECRET) as JWTPayload;
  } catch (err) {
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
