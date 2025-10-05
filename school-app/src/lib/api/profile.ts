// lib/api/profile.ts
import { prisma } from "@/lib/prisma/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export interface SuperAdminProfile {
  id: number;
  title?: string | null;
  bio?: string | null;
  avatar?: string | null;
  department?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StudentProfile {
  id: string;
  admissionNumber?: string | null;
  admissionDate?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  currentGrade: string;
  status: string;
  classroomId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TeacherProfile {
  id: number;
  employeeId: string;
  hireDate: string;
  specialization?: string | null;
  qualification?: string | null;
  profilePicture?: string | null;
  department?: string | null;
}

export interface ParentProfile {
  id: number;
  occupation?: string | null;
  phoneNumber?: string | null;
  address?: string | null;
  profilePicture?: string | null;
}

export interface StaffProfile {
  id: number;
  employeeId: string;
  department?: string | null;
  hireDate: string;
  profilePicture?: string | null;
}

export interface Membership {
  id: number;
  role: string;
}

export interface Profile {
  id: number;
  email: string;
  fullName: string;
  profilePicture?: string | null;
  roles: string[];
  memberships?: Membership[];
  studentProfile?: StudentProfile | null;
  teacherProfile?: TeacherProfile | null;
  parentProfile?: ParentProfile | null;
  staffProfile?: StaffProfile | null;
  superAdminProfile?: SuperAdminProfile | null;
}

export async function apiGetProfile(): Promise<Profile> {
  const res = await fetch("/api/sessions/profile", {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to fetch profile");
  }

  const data = await res.json();
  return data.user as Profile;
}

// ------------------ SERVER-SIDE API ------------------

export async function getProfileFromToken(token: string): Promise<Profile | null> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; roles: string[] };
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        memberships: true,
        studentProfile: true,
        teacherProfile: true,
        parentProfile: true,
        staffProfile: true,
        superAdminMeta: {
          include: { profile: true }, // <-- include SuperAdminProfile relation
        },
        superAdminProfile: true, // include directly linked profile for clarity
      },
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      profilePicture: user.profilePicture,
      roles: user.memberships.map((m) => m.role),
      memberships: user.memberships.map((m) => ({ id: m.id, role: m.role })),
      studentProfile: user.studentProfile ?? undefined,
      teacherProfile: user.teacherProfile ?? undefined,
      parentProfile: user.parentProfile ?? undefined,
      staffProfile: user.staffProfile ?? undefined,
      superAdminProfile: user.superAdminMeta?.profile
        ? {
            id: user.superAdminMeta.profile.id,
            title: user.superAdminMeta.profile.title,
            bio: user.superAdminMeta.profile.bio,
            avatar: user.superAdminMeta.profile.avatar,
            department: user.superAdminMeta.profile.department,
            createdAt: user.superAdminMeta.profile.createdAt.toISOString(),
            updatedAt: user.superAdminMeta.profile.updatedAt.toISOString(),
          }
        : user.superAdminProfile
        ? {
            id: user.superAdminProfile.id,
            title: user.superAdminProfile.title,
            bio: user.superAdminProfile.bio,
            avatar: user.superAdminProfile.avatar,
            department: user.superAdminProfile.department,
            createdAt: user.superAdminProfile.createdAt.toISOString(),
            updatedAt: user.superAdminProfile.updatedAt.toISOString(),
          }
        : undefined,
    };
  } catch (err) {
    return null;
  }
}
