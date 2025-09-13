"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUsersStore } from "@/lib/store/UserStore";
import { User, UserRole } from "@/types/school";

interface Params {
  classId: string;
  studentId: string;
}

export default function StudentDetailPage({ params }: { params: Params }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { fetchUsers, userMap, studentsForTeacher, childrenForParent } =
    useUsersStore();

  const [student, setStudent] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedParents, setRelatedParents] = useState<User[]>([]);

  useEffect(() => {
    async function loadStudent() {
      setLoading(true);
      try {
        // Fetch users from store/API
        await fetchUsers();

        const studentData = userMap[params.studentId];

        if (!studentData) {
          router.push("/404");
          return;
        }

        setStudent(studentData);

        // If teacher, get all students for this class and their parents
        if (studentData.role === UserRole.STUDENT) {
          const teacherId = studentData.teacherClasses?.[0]?.teacherId || "";
          const classStudents = studentsForTeacher(teacherId);
          const parents = classStudents
            .map((s) => s.parent)
            .filter((p): p is User => !!p);
          setRelatedParents(parents);
        }

        // If parent, fetch their children
        if (studentData.role === UserRole.PARENT) {
          const children = childrenForParent(studentData.id);
          setRelatedParents(children);
        }
      } catch (err) {
        console.error("Failed to load student:", err);
      } finally {
        setLoading(false);
      }
    }

    loadStudent();
  }, [
    params.studentId,
    fetchUsers,
    router,
    studentsForTeacher,
    childrenForParent,
  ]);

  if (loading) return <p className="text-textSecondary">Loading details...</p>;
  if (!student) return <p className="text-textSecondary">Student not found</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-textPrimary mb-4">
        {student.name}
      </h1>

      <div className="mb-6 space-y-2">
        <p className="text-textSecondary">
          <span className="font-medium">Email:</span> {student.email}
        </p>
        <p className="text-textSecondary">
          <span className="font-medium">Phone:</span> {student.phone || "N/A"}
        </p>
        <p className="text-textSecondary">
          <span className="font-medium">DOB:</span>{" "}
          {student.dob ? new Date(student.dob).toLocaleDateString() : "N/A"}
        </p>
        <p className="text-textSecondary">
          <span className="font-medium">Gender:</span> {student.gender || "N/A"}
        </p>
      </div>

      <h2 className="text-xl font-semibold text-textPrimary mb-3">
        Parent Details
      </h2>

      {relatedParents.length > 0 ? (
        relatedParents.map((parent) => (
          <div
            key={parent.id}
            className="bg-surface border border-border p-4 rounded-lg shadow-sm space-y-2 mb-3"
          >
            <p className="text-textPrimary font-medium">{parent.name}</p>
            <p className="text-textSecondary">
              <span className="font-medium">Email:</span> {parent.email}
            </p>
            <p className="text-textSecondary">
              <span className="font-medium">Phone:</span>{" "}
              {parent.phone || "N/A"}
            </p>
          </div>
        ))
      ) : (
        <p className="text-textMuted">Parent information not available.</p>
      )}
    </div>
  );
}
