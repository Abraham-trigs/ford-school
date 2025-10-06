import { prisma } from "@/lib/prisma/prisma";
import bcrypt from "bcryptjs";

interface CreateStudentData {
  email: string;
  fullName: string;
  password: string;
  profilePicture?: string;
  schoolSessionId: string;
  profileData?: Record<string, any>;
}

interface UpdateStudentData {
  userId: string;
  schoolSessionId: string;
  profileData?: Record<string, any>;
}

// --------------------
// Create student
// --------------------
export async function createStudent(data: CreateStudentData) {
  const { email, fullName, password, profilePicture, schoolSessionId, profileData } = data;
  const hashedPassword = await bcrypt.hash(password, 12);

  const studentUser = await prisma.$transaction(async (tx) => {
    // Create user
    const user = await tx.user.create({
      data: { email, fullName, password: hashedPassword, profilePicture },
    });

    // Create student profile
    await tx.studentProfile.create({
      data: { userId: user.id, ...profileData },
    });

    // Create user-school membership
    await tx.userSchoolSession.create({
      data: { userId: user.id, schoolSessionId, role: "STUDENT", active: true },
    });

    return user;
  });

  // Return full profile including user and memberships
  return prisma.studentProfile.findFirst({
    where: { userId: studentUser.id },
    include: { user: true, memberships: { include: { schoolSession: true } } },
  });
}

// --------------------
// Update student
// --------------------
export async function updateStudent({ userId, profileData }: UpdateStudentData) {
  return prisma.studentProfile.update({
    where: { userId },
    data: { ...profileData },
    include: { user: true, memberships: { include: { schoolSession: true } } },
  });
}

// --------------------
// Delete student
// --------------------
export async function deleteStudent(userId: string, schoolSessionId: string) {
  await prisma.$transaction(async (tx) => {
    // Delete specific user-school session first
    await tx.userSchoolSession.delete({
      where: { userId_schoolSessionId: { userId, schoolSessionId } },
    });

    // Delete profile + user if no remaining active memberships
    const remainingMemberships = await tx.userSchoolSession.count({ where: { userId } });
    if (remainingMemberships === 0) {
      await tx.studentProfile.delete({ where: { userId } });
      await tx.user.delete({ where: { id: userId } });
    }
  });
}
