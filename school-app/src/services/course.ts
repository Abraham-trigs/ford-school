// /services/course.ts
import { prisma } from "@/lib/prisma/prisma";
import { invalidateByTags } from "@/lib/redis";
import { Prisma } from "@prisma/client";

type Payload = { userId: number | string; roles: string[] };

interface GetCoursesParams {
  schoolSessionId?: number;
  allowedSchoolIds: number[] | "all";
  page: number;
  pageSize: number;
}

export async function getCourses({
  schoolSessionId,
  allowedSchoolIds,
  page,
  pageSize,
}: GetCoursesParams) {
  const where: Prisma.CourseWhereInput = {
    deletedAt: null,
    ...(schoolSessionId
      ? { schoolSessionId }
      : allowedSchoolIds === "all"
      ? {}
      : { schoolSessionId: { in: allowedSchoolIds } }),
  };

  const [items, total] = await prisma.$transaction([
    prisma.course.findMany({
      where,
      include: {
        teacher: true,
        students: true,
        assignments: true,
        schoolSession: true,
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    }),
    prisma.course.count({ where }),
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

export async function createCourse(
  data: {
    name: string;
    description?: string;
    teacherId?: number;
    schoolSessionId: number;
  },
  payload: Payload
) {
  // Service-level authorization
  if (!payload.roles.includes("SUPERADMIN")) {
    const membership = await prisma.userSchoolSession.findFirst({
      where: {
        userId: Number(payload.userId),
        schoolSessionId: data.schoolSessionId,
        active: true,
      },
    });
    if (!membership) throw new Error("Forbidden");
  }

  const course = await prisma.course.create({
    data: {
      name: data.name,
      description: data.description ?? null,
      teacherId: data.teacherId ?? null,
      schoolSessionId: data.schoolSessionId,
    },
    include: {
      teacher: true,
      students: true,
      assignments: true,
      schoolSession: true,
    },
  });

  // Atomic invalidate for that school
  await invalidateByTags("course", [data.schoolSessionId]);

  return course;
}

export async function updateCourse(
  data: { id: number; name?: string; description?: string; teacherId?: number },
  payload: Payload
) {
  const existing = await prisma.course.findUnique({
    where: { id: data.id },
    select: { id: true, schoolSessionId: true, deletedAt: true },
  });
  if (!existing || existing.deletedAt) throw new Error("NotFound");

  // Authorization: check membership efficiently
  if (!payload.roles.includes("SUPERADMIN")) {
    const membership = await prisma.userSchoolSession.findFirst({
      where: {
        userId: Number(payload.userId),
        schoolSessionId: existing.schoolSessionId,
        active: true,
      },
    });
    if (!membership) throw new Error("Forbidden");
  }

  const updated = await prisma.course.update({
    where: { id: data.id },
    data: {
      name: data.name ?? undefined,
      description: data.description ?? undefined,
      teacherId: data.teacherId ?? undefined,
    },
    include: {
      teacher: true,
      students: true,
      assignments: true,
      schoolSession: true,
    },
  });

  await invalidateByTags("course", [existing.schoolSessionId]);

  return updated;
}

export async function deleteCourse(id: number, payload: Payload) {
  const existing = await prisma.course.findUnique({
    where: { id },
    select: { id: true, schoolSessionId: true, deletedAt: true },
  });
  if (!existing || existing.deletedAt) throw new Error("NotFound");

  if (!payload.roles.includes("SUPERADMIN")) {
    const membership = await prisma.userSchoolSession.findFirst({
      where: {
        userId: Number(payload.userId),
        schoolSessionId: existing.schoolSessionId,
        active: true,
      },
    });
    if (!membership) throw new Error("Forbidden");
  }

  const deleted = await prisma.course.update({
    where: { id },
    data: { deletedAt: new Date() },
    include: { schoolSession: true },
  });

  await invalidateByTags("course", [existing.schoolSessionId]);

  return deleted;
}
