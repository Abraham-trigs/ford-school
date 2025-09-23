import { NextResponse } from "next/server";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import { Role, User } from "@/types/school";
import jwt, { JwtPayload } from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET as string;
const TOKEN_EXPIRES_IN = "7d"; // you can adjust this (e.g., "1h", "30d")

export interface Caller {
  id: string;
  role: Role;
  children?: { id: string }[];
}

/**
 * A strongly typed JWT payload used in this app.
 */
interface CallerJwtPayload extends JwtPayload {
  id: string;
  role: Role;
  children?: { id: string }[];
}

// ---------------- Helpers ----------------

/**
 * Create a signed JWT token for a caller.
 */
export function signToken(caller: Caller): string {
  return jwt.sign(
    {
      id: caller.id,
      role: caller.role,
      children: caller.children ?? [],
    } as CallerJwtPayload,
    SECRET,
    { expiresIn: TOKEN_EXPIRES_IN }
  );
}

/**
 * Authenticate the request by looking for a JWT
 * in either cookies or the Authorization header.
 */
export async function authenticate(req: Request): Promise<Caller | null> {
  try {
    let token: string | undefined;

    // Try cookie first
    const cookieHeader = req.headers.get("cookie") || "";
    token = cookieHeader
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith("session="))
      ?.split("=")[1];

    // If no cookie, fallback to Authorization header
    if (!token) {
      const authHeader = req.headers.get("authorization") ?? undefined;
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.slice(7);
      }
    }

    if (!token) return null;

    const decoded = jwt.verify(token, SECRET) as CallerJwtPayload;
    return {
      id: decoded.id,
      role: decoded.role,
      children: decoded.children ?? [],
    };
  } catch (err) {
    console.error("Auth failed:", err);
    return null;
  }
}

export function errorResponse(message: string, status = 403) {
  return NextResponse.json({ error: message }, { status });
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

// ---------------- User Helpers ----------------

/**
 * Find a user by ID with safe field selection.
 */
export async function findUserById(id: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      profilePic: true,
      parentOf: { select: { id: true } }, // Needed for parent checks
    },
  });
}

/**
 * Get all users a caller is allowed to access based on their role.
 */
export async function getUsersForCaller(caller: Caller): Promise<User[]> {
  if (!caller) return [];

  const baseSelect = {
    id: true,
    name: true,
    email: true,
    phone: true,
    role: true,
    status: true,
    createdAt: true,
  };

  switch (caller.role) {
    case Role.SUPERADMIN:
      return prisma.user.findMany({ select: baseSelect });

    case Role.ADMIN:
      return prisma.user.findMany({
        where: { role: { not: Role.SUPERADMIN } },
        select: baseSelect,
      });

    case Role.SECRETARY:
    case Role.ACCOUNTANT:
    case Role.LIBRARIAN:
      return prisma.user.findMany({ select: baseSelect });

    case Role.TEACHER: {
      const teacherSections = await prisma.section.findMany({
        where: { teacherId: caller.id },
        select: { students: { select: { id: true } } },
      });
      const studentIds = teacherSections.flatMap((s) =>
        s.students.map((st) => st.id)
      );
      return prisma.user.findMany({
        where: { id: { in: studentIds } },
        select: baseSelect,
      });
    }

    case Role.COUNSELOR:
    case Role.NURSE:
      if (!caller.children?.length) return [];
      return prisma.user.findMany({
        where: { id: { in: caller.children.map((c) => c.id) } },
        select: baseSelect,
      });

    case Role.STUDENT:
      return prisma.user.findMany({
        where: { id: caller.id },
        select: baseSelect,
      });

    case Role.PARENT:
      if (!caller.children?.length) return [];
      return prisma.user.findMany({
        where: { id: { in: caller.children.map((c) => c.id) } },
        select: baseSelect,
      });

    default:
      return [];
  }
}

/**
 * Check if a caller has permission to access a specific user.
 */
export async function canAccessUser(
  caller: Caller,
  targetUser: User
): Promise<boolean> {
  switch (caller.role) {
    case Role.SUPERADMIN:
    case Role.ADMIN:
    case Role.SECRETARY:
    case Role.ACCOUNTANT:
    case Role.LIBRARIAN:
      return true;

    case Role.STUDENT:
      return caller.id === targetUser.id;

    case Role.PARENT:
      return targetUser.parentOf?.some((child) => child.id === caller.id) ?? false;

    case Role.TEACHER: {
      const teacherSections = await prisma.section.findMany({
        where: { teacherId: caller.id },
        select: { students: { select: { id: true } } },
      });
      const studentIds = teacherSections.flatMap((s) =>
        s.students.map((st) => st.id)
      );
      return studentIds.includes(targetUser.id);
    }

    case Role.COUNSELOR:
    case Role.NURSE:
      if (!caller.children?.length) return false;
      return caller.children.map((c) => c.id).includes(targetUser.id);

    default:
      return false;
  }
}
