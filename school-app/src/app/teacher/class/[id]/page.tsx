"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSchoolStore } from "@/lib/store/SchoolStore";

interface Params {
  id: string;
}

export default function ClassDetailPage({ params }: { params: Params }) {
  const router = useRouter();
  const fetchClassById = useSchoolStore((state) => state.fetchClassById);
  const classesMap = useSchoolStore((state) => state.classesMap);

  const [classData, setClassData] = useState<
    (typeof classesMap)[string] | null
  >(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadClass() {
      setLoading(true);
      try {
        const cls = await fetchClassById(params.id);
        if (!cls) {
          router.push("/404"); // optional: redirect if class not found
          return;
        }
        setClassData(cls);
      } catch (err) {
        console.error("Error loading class:", err);
      } finally {
        setLoading(false);
      }
    }

    loadClass();
  }, [params.id, fetchClassById, router]);

  if (loading) return <p className="text-textSecondary">Loading...</p>;
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
      {classData.students.length === 0 ? (
        <p className="text-textMuted">No students enrolled in this class.</p>
      ) : (
        <ul className="space-y-2">
          {classData.students.map((student) => (
            <li
              key={student.id}
              className="bg-surface border border-border p-3 rounded-lg shadow-sm"
            >
              <p className="text-textPrimary font-medium">{student.name}</p>
              <p className="text-sm text-textSecondary">
                Email: {student.email}
              </p>
              <p className="text-sm text-textSecondary">
                Parent: {student.parent?.name || "N/A"}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
