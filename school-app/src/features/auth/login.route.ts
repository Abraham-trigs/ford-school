import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { loginUser } from "@/services/auth.service";
import { setRefreshCookie } from "@/lib/auth/cookies";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  schoolId: z.string().cuid(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  try {
    const { email, password, schoolId } = loginSchema.parse(req.body);

    const { user, accessToken, refreshToken } = await loginUser(email, password, schoolId);

    setRefreshCookie(res, refreshToken);

    res.status(200).json({
      user: { id: user.id, email: user.email, role: user.role, school: { id: user.school.id, name: user.school.name } },
      accessToken,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}
