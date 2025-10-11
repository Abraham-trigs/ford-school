import { serialize, parse } from "cookie";
import { NextApiRequest, NextApiResponse } from "next";

const COOKIE_NAME = "formless_refresh_token";

export function setRefreshCookie(res: NextApiResponse, token: string) {
  res.setHeader("Set-Cookie", serialize(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  }));
}

export function clearRefreshCookie(res: NextApiResponse) {
  res.setHeader("Set-Cookie", serialize(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  }));
}

export function parseCookies(req: NextApiRequest) {
  return parse(req.headers.cookie || "");
}
