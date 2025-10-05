// lib/api/dashboard.ts
import { fetchWrapper } from "./fetchWrapper"; // optional: your fetch helper

export async function apiGetSuperadminDashboard() {
  // Temporary dummy data for dashboard
  return {
    totalUsers: 10,
    totalStudents: 50,
    totalTeachers: 5,
    recentActivities: [
      { id: 1, activity: "User John created", date: new Date() },
      { id: 2, activity: "New student enrolled", date: new Date() },
    ],
  };

  // If you have a real API:
  // return fetchWrapper("/api/dashboard/superadmin").then(res => res.json());
}
