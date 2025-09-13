"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useClassStore } from "@/lib/store/ClassStore";

// Define a type that includes teacher and students relationships
interface ClassWithRelations {
  id: string;
  name: string;
  teacher?: { id: string; name: string } | null;
  students?: Array<{
    id: string;
    name: string;
    email: string;
    parent?: { id: string; name: string } | null;
  }>;
}

interface Params {
  id: string; // classId
}

export default function ClassDetailPage({ params }: { params: Params }) {
  const router = useRouter();
  const { classMap, classLoading, fetchClass } = useClassStore();

  const [classData, setClassData] = useState<ClassWithRelations | null>(null);

  useEffect(() => {
    async function loadClass() {
      if (!classMap[params.id]) {
        await fetchClass();
      }

      const cls = classMap[params.id] as ClassWithRelations | undefined;
      if (!cls) {
        router.push("/404");
        return;
      }

      setClassData(cls);
    }

    loadClass();
  }, [params.id, classMap, fetchClass, router]);

  if (classLoading) return <p className="text-textSecondary">Loading...</p>;
  if (!classData) return <p className="text-textSecondary">Class not found</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-textPrimary mb-4">
        {classData.name}
      </h1>
      <p className="text-textSecondary mb-6">
        Teacher:{" "}
        <span className="font-medium">
          {classData.teacher?.name || "Unassigned"}
        </span>
      </p>

      <h2 className="text-xl font-semibold text-textPrimary mb-3">Students</h2>
      {classData.students?.length === 0 ? (
        <p className="text-textMuted">No students enrolled in this class.</p>
      ) : (
        <ul className="space-y-3">
          {classData.students.map((student) => (
            <li
              key={student.id}
              className="bg-surface border border-border p-4 rounded-lg shadow-sm flex justify-between items-center transition-transform duration-200 hover:scale-[1.02] hover:shadow-lg"
            >
              <div>
                <p className="text-textPrimary font-medium">{student.name}</p>
                <p className="text-sm text-textSecondary">
                  Email: {student.email}
                </p>
                <p className="text-sm text-textSecondary">
                  Parent: {student.parent?.name || "N/A"}
                </p>
              </div>
              <Link
                href={`/teacher/class/${classData.id}/${student.id}`}
                className="inline-block px-4 py-2 rounded-lg bg-light text-back font-medium hover:bg-wine transition-colors"
              >
                View Details
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
