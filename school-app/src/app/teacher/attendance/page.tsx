"use client";

import { useEffect, useState } from "react";
import { useSchoolStore } from "@/lib/store/SchoolStore";
import type { Attendance } from "@/types/users";

const colors = {
  wine: "#72040e",
  light: "#920055",
  back: "#dee4ea",
  switch: "#eee6e6",
};

export default function AttendancePage() {
  const fetchAttendance = useSchoolStore((state) => state.fetchAttendance);
  const attendancesMap = useSchoolStore((state) => state.attendancesMap);
  const attendanceIds = useSchoolStore((state) => state.attendanceIds);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchAttendance();
      setLoading(false);
    };
    load();
  }, [fetchAttendance]);

  if (loading)
    return (
      <p className="text-lg" style={{ color: colors.wine }}>
        Loading attendance...
      </p>
    );

  const attendances: Attendance[] = attendanceIds.map(
    (id) => attendancesMap[id]
  );

  if (!attendances.length)
    return (
      <p className="text-lg" style={{ color: colors.wine }}>
        No attendance records found.
      </p>
    );

  return (
    <div className="p-6" style={{ backgroundColor: colors.back }}>
      <h1 className="text-2xl font-bold mb-4" style={{ color: colors.wine }}>
        Attendance Records
      </h1>
      <table className="w-full border" style={{ borderColor: colors.light }}>
        <thead style={{ backgroundColor: colors.switch }}>
          <tr>
            <th className="p-2 border-b" style={{ borderColor: colors.light }}>
              Student Name
            </th>
            <th className="p-2 border-b" style={{ borderColor: colors.light }}>
              Class
            </th>
            <th className="p-2 border-b" style={{ borderColor: colors.light }}>
              Date
            </th>
            <th className="p-2 border-b" style={{ borderColor: colors.light }}>
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {attendances.map((a) => (
            <tr
              key={a.id}
              style={{
                backgroundColor:
                  attendances.indexOf(a) % 2 === 0
                    ? colors.back
                    : colors.switch,
              }}
            >
              <td
                className="p-2 border-b"
                style={{ borderColor: colors.light, color: colors.wine }}
              >
                {a.student.name}
              </td>
              <td
                className="p-2 border-b"
                style={{ borderColor: colors.light, color: colors.wine }}
              >
                {a.class.name}
              </td>
              <td
                className="p-2 border-b"
                style={{ borderColor: colors.light, color: colors.wine }}
              >
                {new Date(a.date).toLocaleDateString()}
              </td>
              <td
                className="p-2 border-b"
                style={{ borderColor: colors.light, color: colors.wine }}
              >
                {a.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
