"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useClassStore } from "@/lib/store/ClassStore";

export default function ClassPage() {
  const { classMap, classIds, classLoading, fetchClass } = useClassStore();

  // Fetch classes on mount
  useEffect(() => {
    fetchClass();
  }, [fetchClass]);

  // Convert map to array for rendering
  const classesList = classIds.map((id) => classMap[id]);

  return (
    <div className="min-h-screen bg-back p-6">
      <h1 className="text-2xl font-bold text-wine mb-6">My Class</h1>

      {classLoading ? (
        <p className="text-wine">Loading class...</p>
      ) : classesList.length === 0 ? (
        <p className="text-light">No class found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classesList.map((cls) => (
            <div
              key={cls.id}
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
          ))}
        </div>
      )}
    </div>
  );
}
