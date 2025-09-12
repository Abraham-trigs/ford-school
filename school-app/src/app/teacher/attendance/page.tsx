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
  const pageSize = useSchoolStore((state) => state.pageSize);

  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState<string>("");
  const [attendanceDates, setAttendanceDates] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Load attendance
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchAttendance();
      setLoading(false);
    };
    load();
  }, [fetchAttendance]);

  // Compute attendance dates
  useEffect(() => {
    if (!attendanceIds.length) {
      const today = new Date().toISOString().split("T")[0];
      setCurrentDate(today);
      setAttendanceDates([today]);
      setCurrentPage(1);
      return;
    }

    const dates = Array.from(
      new Set(attendanceIds.map((id) => attendancesMap[id].date.split("T")[0]))
    ).sort();

    const today = new Date().toISOString().split("T")[0];
    const hasToday = dates.includes(today);

    setCurrentDate(hasToday ? today : dates[dates.length - 1]);
    setAttendanceDates(dates);
    setCurrentPage(1);
  }, [attendanceIds, attendancesMap]);

  // Filter attendances for the current date
  const attendancesForDate: Attendance[] = attendanceIds
    .map((id) => attendancesMap[id])
    .filter((a) => a.date.split("T")[0] === currentDate);

  const totalPages = Math.ceil(attendancesForDate.length / pageSize);
  const paginatedAttendances = attendancesForDate.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  if (loading)
    return (
      <p className="text-lg" style={{ color: colors.wine }}>
        Loading attendance...
      </p>
    );

  const handlePrevDay = () => {
    const idx = attendanceDates.indexOf(currentDate);
    if (idx > 0) {
      setCurrentDate(attendanceDates[idx - 1]);
      setCurrentPage(1);
    }
  };

  const handleNextDay = () => {
    const idx = attendanceDates.indexOf(currentDate);
    if (idx >= 0 && idx < attendanceDates.length - 1) {
      setCurrentDate(attendanceDates[idx + 1]);
      setCurrentPage(1);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentDate(e.target.value);
    setCurrentPage(1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div
      className="p-6 overflow-x-auto"
      style={{ backgroundColor: colors.back }}
    >
      <h1 className="text-2xl font-bold mb-4" style={{ color: colors.wine }}>
        Attendance Records
      </h1>

      {/* Date Navigation */}
      <div className="flex gap-2 mb-4 items-center flex-wrap">
        <button
          className="px-3 py-1 rounded"
          style={{
            backgroundColor: colors.light,
            color: colors.back,
            cursor:
              attendanceDates.indexOf(currentDate) <= 0
                ? "not-allowed"
                : "pointer",
          }}
          onClick={handlePrevDay}
          disabled={attendanceDates.indexOf(currentDate) <= 0}
        >
          Previous Day
        </button>

        <input
          type="date"
          value={currentDate}
          min={attendanceDates[0]}
          max={attendanceDates[attendanceDates.length - 1]}
          onChange={handleDateChange}
          className="p-1 rounded border"
          style={{
            borderColor: colors.light,
            backgroundColor: colors.switch,
            color: colors.wine,
          }}
        />

        <button
          className="px-3 py-1 rounded"
          style={{
            backgroundColor:
              attendanceDates.indexOf(currentDate) ===
              attendanceDates.length - 1
                ? colors.switch
                : colors.light,
            color:
              attendanceDates.indexOf(currentDate) ===
              attendanceDates.length - 1
                ? colors.wine
                : colors.back,
            cursor:
              attendanceDates.indexOf(currentDate) ===
              attendanceDates.length - 1
                ? "not-allowed"
                : "pointer",
          }}
          onClick={handleNextDay}
          disabled={
            attendanceDates.indexOf(currentDate) === attendanceDates.length - 1
          }
        >
          Next Day
        </button>
      </div>

      {/* Attendance Table */}
      {attendancesForDate.length === 0 ? (
        <p className="text-lg" style={{ color: colors.wine }}>
          No attendance records found for {currentDate}.
        </p>
      ) : (
        <>
          <table
            className="min-w-full border border-collapse"
            style={{ borderColor: colors.light }}
          >
            <thead
              className="sticky top-0"
              style={{ backgroundColor: colors.switch, zIndex: 10 }}
            >
              <tr>
                <th
                  className="p-2 border-b text-left"
                  style={{ borderColor: colors.light, color: colors.wine }}
                >
                  Student Name
                </th>
                <th
                  className="p-2 border-b text-left"
                  style={{ borderColor: colors.light, color: colors.wine }}
                >
                  Class
                </th>
                <th
                  className="p-2 border-b text-left"
                  style={{ borderColor: colors.light, color: colors.wine }}
                >
                  Date
                </th>
                <th
                  className="p-2 border-b text-left"
                  style={{ borderColor: colors.light, color: colors.wine }}
                >
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedAttendances.map((a, idx) => (
                <tr
                  key={a.id}
                  className="transition-colors duration-200 cursor-pointer"
                  style={{
                    backgroundColor:
                      idx % 2 === 0 ? colors.back : colors.switch,
                  }}
                  onMouseEnter={(e) => {
                    (
                      e.currentTarget as HTMLTableRowElement
                    ).style.backgroundColor = colors.light;
                    (e.currentTarget as HTMLTableRowElement).style.color =
                      colors.back;
                  }}
                  onMouseLeave={(e) => {
                    (
                      e.currentTarget as HTMLTableRowElement
                    ).style.backgroundColor =
                      idx % 2 === 0 ? colors.back : colors.switch;
                    (e.currentTarget as HTMLTableRowElement).style.color =
                      colors.wine;
                  }}
                >
                  <td
                    className="p-2 border-b"
                    style={{ borderColor: colors.light }}
                  >
                    {a.student.name}
                  </td>
                  <td
                    className="p-2 border-b"
                    style={{ borderColor: colors.light }}
                  >
                    {a.class.name}
                  </td>
                  <td
                    className="p-2 border-b"
                    style={{ borderColor: colors.light }}
                  >
                    {new Date(a.date).toLocaleDateString()}
                  </td>
                  <td
                    className="p-2 border-b"
                    style={{ borderColor: colors.light }}
                  >
                    {a.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex gap-2 mt-4 items-center">
              <button
                className="px-3 py-1 rounded"
                style={{
                  backgroundColor: colors.light,
                  color: colors.back,
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                }}
                onClick={handlePrevPage}
                disabled={currentPage === 1}
              >
                Prev Page
              </button>

              <span style={{ color: colors.wine }}>
                Page {currentPage} of {totalPages}
              </span>

              <button
                className="px-3 py-1 rounded"
                style={{
                  backgroundColor: colors.light,
                  color: colors.back,
                  cursor:
                    currentPage === totalPages ? "not-allowed" : "pointer",
                }}
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                Next Page
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
