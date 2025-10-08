import { NextApiRequest, NextApiResponse } from "next";
import { parseCookies } from "@/lib/auth/cookies";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { prisma} from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ message: "Method not allowed" });

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) throw new Error("No Authorization header");

    const token = authHeader.split(" ")[1];
    const decoded: any = verifyAccessToken(token);

    const user = await prisma.userSession.findUnique({
      where: { id: decoded.userId },
      include: { school: true },
    });
    if (!user) throw new Error("User not found");

    res.status(200).json({
      id: user.id,
      email: user.email,
      role: user.role,
      school: { id: user.school.id, name: user.school.name },
    });
  } catch (err: any) {
    res.status(401).json({ message: err.message });
  }
}
