import jwt from "jsonwebtoken";

export function signJwt(payload: object, expiresIn?: string | number) {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: expiresIn || process.env.JWT_EXPIRES_IN });
}

export function verifyJwt(token: string) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!);
  } catch {
    return null;
  }
}
