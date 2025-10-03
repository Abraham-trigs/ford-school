// app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET!;

// --- Profile field whitelists ---
const profileFieldsWhitelist: Record<string, string[]> = {
  STUDENT: ["admissionNumber","admissionDate","dateOfBirth","gender","currentGrade","status","classroomId"],
  TEACHER: ["employeeId","hireDate","specialization","qualification","profilePicture","department"],
  STAFF: ["employeeId","hireDate","profilePicture","department"],
  PARENT: ["occupation","phoneNumber","address","profilePicture"],
};

// --- Helper: filter allowed profile data ---
function filterProfileData(role: string, profileData: any) {
  const allowed = profileFieldsWhitelist[role] || [];
  return allowed.reduce((acc, key) => {
    if (key in profileData) acc[key] = profileData[key];
    return acc;
  }, {} as any);
}

// --- Helper: verify JWT ---
async function verifyToken(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) throw { status: 401, message: "Unauthorized" };
  const token = authHeader.split(" ")[1];
  try { return jwt.verify(token, JWT_SECRET) as any; }
  catch { throw { status: 401, message: "Invalid token" }; }
}

// --- Helper: check if requester can manage a user ---
function canManageUser(requesterRoles: string[], requesterMemberships: number[], userMemberships: number[]) {
  if (requesterRoles.includes("SUPERADMIN")) return true;
  if (requesterRoles.includes("ADMIN")) {
    return userMemberships.some(id => requesterMemberships.includes(id));
  }
  return false;
}

// --- GET: fetch single user by ID ---
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const payload = await verifyToken(req);
    const { roles, userId: requesterId } = payload;
    const userId = parseInt(params.id);
    if (isNaN(userId)) return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { memberships: { include: { schoolSession: true } }, studentProfile: true, teacherProfile: true, staffProfile: true, parentProfile: true },
    });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Access control
    if (!roles.includes("SUPERADMIN")) {
      const requesterMemberships = await prisma.userSchoolSession.findMany({
        where: { userId: requesterId, active: true },
      }).then(ms => ms.map(m => m.schoolSessionId));
      const userMemberships = user.memberships.map(m => m.schoolSessionId);
      if (!canManageUser(roles, requesterMemberships, userMemberships)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ data: user });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: err.status || 500 });
  }
}

// --- PUT: update user ---
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const payload = await verifyToken(req);
    const { roles, userId: requesterId } = payload;
    const userId = parseInt(params.id);
    if (isNaN(userId)) return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });

    const body = await req.json();
    const { email, fullName, password, profilePicture, role, schoolSessionId, profileData } = body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { memberships: true, studentProfile: true, teacherProfile: true, staffProfile: true, parentProfile: true },
    });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const requesterMemberships = await prisma.userSchoolSession.findMany({ where: { userId: requesterId, active: true } }).then(ms => ms.map(m => m.schoolSessionId));
    const userMemberships = user.memberships.map(m => m.schoolSessionId);
    if (!canManageUser(roles, requesterMemberships, userMemberships)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const hashedPassword = password ? await bcrypt.hash(password, 12) : undefined;
    const safeProfileData = profileData ? filterProfileData(role, profileData) : undefined;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        email: email ?? undefined,
        fullName: fullName ?? undefined,
        profilePicture: profilePicture ?? undefined,
        memberships: schoolSessionId
          ? {
              upsert: {
                where: { userId_schoolSessionId: { userId, schoolSessionId } },
                update: { email: email ?? undefined, password: hashedPassword, role },
                create: { email, password: hashedPassword ?? crypto.randomBytes(12).toString("hex"), role, schoolSessionId },
              },
            }
          : undefined,
        studentProfile: role === "STUDENT" && safeProfileData ? { upsert: { where: { userId }, update: safeProfileData, create: safeProfileData } } : undefined,
        teacherProfile: ["TEACHER","PRINCIPAL","VICE_PRINCIPAL"].includes(role) && safeProfileData ? { upsert: { where: { userId }, update: safeProfileData, create: safeProfileData } } : undefined,
        staffProfile: ["FINANCE","HR","RECEPTIONIST","IT_SUPPORT","TRANSPORT","NURSE","COOK","CLEANER","SECURITY","MAINTENANCE"].includes(role) && safeProfileData ? { upsert: { where: { userId }, update: safeProfileData, create: safeProfileData } } : undefined,
        parentProfile: role === "PARENT" && safeProfileData ? { upsert: { where: { userId }, update: safeProfileData, create: safeProfileData } } : undefined,
      },
      include: { memberships: true, studentProfile: true, teacherProfile: true, staffProfile: true, parentProfile: true },
    });

    // Remove sensitive info
    if (updatedUser.memberships) updatedUser.memberships = updatedUser.memberships.map(m => ({ ...m, password: undefined }));

    console.log(`[AUDIT] User ${requesterId} updated user ${userId} at ${new Date().toISOString()}`);

    return NextResponse.json({ data: updatedUser });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: err.status || 500 });
  }
}

// --- DELETE: soft-delete user ---
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const payload = await verifyToken(req);
    const { roles, userId: requesterId } = payload;
    const userId = parseInt(params.id);
    if (isNaN(userId)) return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { id: userId }, include: { memberships: true } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const requesterMemberships = await prisma.userSchoolSession.findMany({ where: { userId: requesterId, active: true } }).then(ms => ms.map(m => m.schoolSessionId));
    const userMemberships = user.memberships.map(m => m.schoolSessionId);
    if (!canManageUser(roles, requesterMemberships, userMemberships)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const deletedUser = await prisma.user.update({ where: { id: userId }, data: { deletedAt: new Date() } });

    console.log(`[AUDIT] User ${requesterId} soft-deleted user ${userId} at ${new Date().toISOString()}`);

    return NextResponse.json({ data: { id: deletedUser.id, deletedAt: deletedUser.deletedAt } });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: err.status || 500 });
  }
}
