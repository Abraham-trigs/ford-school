import { prisma } from "@/lib/prisma/prisma";
import { invalidateByTags } from "@/lib/redis";
import { Prisma } from "@prisma/client";

interface GetClassroomsParams {
  schoolId?: number;
  allowedSchoolIds: number[] | "all";
  page: number;
  pageSize: number;
}

export async function getClassrooms({
  schoolId,
  allowedSchoolIds,
  page,
  pageSize,
}: GetClassroomsParams) {
  const where: Prisma.ClassroomWhereInput = {
    deletedAt: null,
    ...(schoolId
      ? { schoolSessionId: schoolId }
      : allowedSchoolIds === "all"
      ? {}
      : { schoolSessionId: { in: allowedSchoolIds } }),
  };

  const [items, total] = await prisma.$transaction([
    prisma.classroom.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        schoolSession: {
          include: { school: true },
        },
      },
    }),
    prisma.classroom.count({ where }),
  ]);

  return {
    data: items,
    meta: {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

// ----------------------------
// 🔹 Create Classroom
// ----------------------------
export async function createClassroom(data: {
  name: string;
  grade?: string;
  schoolSessionId: number;
}) {
  const classroom = await prisma.classroom.create({
    data: {
      name: data.name,
      grade: data.grade,
      schoolSessionId: data.schoolSessionId,
    },
  });

  // Tag invalidation handled by route after creation
  return classroom;
}

// ----------------------------
// 🔹 Update Classroom
// ----------------------------
export async function updateClassroom(
  data: { id: number; name?: string; grade?: string },
  payload: { userId: number; roles: string[] }
) {
  const existing = await prisma.classroom.findUnique({
    where: { id: data.id, deletedAt: null },
    select: { id: true, schoolSessionId: true },
  });
  if (!existing) throw new Error("Classroom not found");

  // Authorization: SUPERADMIN or member of school
  if (!payload.roles.includes("SUPERADMIN")) {
    const membership = await prisma.userSchoolSession.findFirst({
      where: {
        userId: payload.userId,
        schoolSessionId: existing.schoolSessionId,
        active: true,
      },
    });
    if (!membership) throw new Error("Forbidden");
  }

  const updated = await prisma.classroom.update({
    where: { id: data.id },
    data: {
      name: data.name,
      grade: data.grade,
    },
  });

  // Invalidate cache after update
  await invalidateByTags("classroom", [existing.schoolSessionId]);

  return updated;
}

// ----------------------------
// 🔹 Soft Delete Classroom
// ----------------------------
export async function deleteClassroom(
  id: number,
  schoolSessionId: number,
  payload: { userId: number; roles: string[] }
) {
  const existing = await prisma.classroom.findUnique({
    where: { id, deletedAt: null },
    select: { id: true, schoolSessionId: true },
  });
  if (!existing) throw new Error("Classroom not found");

  if (!payload.roles.includes("SUPERADMIN")) {
    const membership = await prisma.userSchoolSession.findFirst({
      where: {
        userId: payload.userId,
        schoolSessionId: existing.schoolSessionId,
        active: true,
      },
    });
    if (!membership) throw new Error("Forbidden");
  }

  await prisma.classroom.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  await invalidateByTags("classroom", [schoolSessionId]);
}
