import { NextApiRequest, NextApiResponse } from "next";
import { parseCookies, setRefreshCookie } from "@/lib/auth/cookies";
import { verifyRefreshToken, signAccessToken, signRefreshToken } from "@/lib/auth/jwt";
import  { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  try {
    const cookies = parseCookies(req);
    const token = cookies.formless_refresh_token;
    if (!token) throw new Error("No refresh token found");

    const decoded: any = verifyRefreshToken(token);

    // Verify token exists in DB
    const session = await prisma.session.findUnique({ where: { token } });
    if (!session) throw new Error("Invalid refresh token");

    // Rotate token
    await prisma.session.delete({ where: { token } });
    const newRefreshToken = signRefreshToken({ userId: decoded.userId });
    await prisma.session.create({
      data: {
        userId: decoded.userId,
        token: newRefreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    const user = await prisma.userSession.findUnique({ where: { id: decoded.userId }, include: { school: true } });
    if (!user) throw new Error("User not found");

    const accessToken = signAccessToken({ userId: user.id, schoolId: user.schoolId, role: user.role });
    setRefreshCookie(res, newRefreshToken);

    res.status(200).json({ accessToken });
  } catch (err: any) {
    res.status(401).json({ message: err.message });
  }
}
