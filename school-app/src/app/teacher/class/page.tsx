"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useSchoolStore } from "@/lib/store/SchoolStore";

export default function ClassesPage() {
  const { fetchClasses, classIds, classesMap, classesLoading } =
    useSchoolStore();

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  return (
    <div className="min-h-screen bg-back p-6">
      <h1 className="text-2xl font-bold text-wine mb-6">My Classes</h1>

      {classesLoading ? (
        <p className="text-wine">Loading classes...</p>
      ) : classIds.length === 0 ? (
        <p className="text-light">No classes found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classIds.map((id) => {
            const cls = classesMap[id];
            return (
              <div
                key={id}
                className="bg-switch border border-wine rounded-xl p-5 shadow-md"
              >
                <h2 className="text-xl font-semibold text-wine">{cls.name}</h2>
                <p className="text-sm text-light mt-1">
                  Teacher: {cls.teacher?.name || "Not assigned"}
                </p>
                <p className="text-sm text-light">
                  Students: {cls.students?.length || 0}
                </p>

                <div className="mt-4">
                  <Link
                    href={`/teacher/class/${cls.id}`}
                    className="inline-block px-4 py-2 rounded-lg bg-light text-back font-medium hover:bg-wine transition-colors"
                  >
                    View Students
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
