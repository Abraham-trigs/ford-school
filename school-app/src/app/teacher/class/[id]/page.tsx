"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Updated typing: parent is always included now
interface User {
  id: string;
  name: string;
  email: string;
  parent: { id: string; name: string; email: string } | null;
}

interface ClassDetail {
  id: string;
  name: string;
  students: User[];
  teacher: { id: string; name: string; email: string } | null;
}

interface Params {
  id: string;
}

export default function ClassDetailPage({ params }: { params: Params }) {
  const router = useRouter();
  const [classData, setClassData] = useState<ClassDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchClass() {
      try {
        const res = await fetch(`/api/classes/${params.id}`);
        if (!res.ok) {
          if (res.status === 401) router.push("/login");
          throw new Error("Failed to fetch class");
        }
        const data: ClassDetail = await res.json();
        setClassData(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchClass();
  }, [params.id, router]);

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
                Parent: {student.parent ? student.parent.name : "N/A"}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
