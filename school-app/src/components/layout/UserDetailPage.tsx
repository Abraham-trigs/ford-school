"use client";

import { useEffect, useState } from "react";
import { useUsersStore } from "@/lib/store/UserStore";
import { useSessionStore } from "@/lib/store/sessionStore";
import type { User } from "@/types/school";
import { Role } from "@/types/school"; // <-- Add this import

interface UserDetailPageProps {
  userId: string;
  onBack?: () => void;
}

export default function UserDetailPage({
  userId,
  onBack,
}: UserDetailPageProps) {
  const fetchUsersIfAllowed = useUsersStore((s) => s.fetchUsersIfAllowed);
  const userMap = useUsersStore((s) => s.userMap);
  const sessionUser = useSessionStore((s) => s.user);

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const loadUser = async () => {
      setLoading(true);
      await fetchUsersIfAllowed();
      setUser(userMap[userId] ?? null);
      setLoading(false);
    };

    loadUser();
  }, [userId, fetchUsersIfAllowed, userMap]);

  if (loading) return <p className="text-gray-400">Loading user details...</p>;
  if (!user) return <p className="text-red-400">User not found.</p>;

  // Get session role
  const sessionRole = sessionUser?.role;

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {onBack && (
        <button
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded"
          onClick={onBack}
        >
          &larr; Back
        </button>
      )}

      <h1 className="text-2xl font-bold">{user.name}</h1>
      <p className="text-sm text-gray-400">
        Role: {user.role} • Status: {user.status} • Joined:{" "}
        {new Date(user.createdAt).toLocaleDateString()}
      </p>

      <hr className="border-gray-700" />

      {/* General Info */}
      <div className="space-y-2">
        {user.email && <p>Email: {user.email}</p>}
        {user.phone && <p>Phone: {user.phone}</p>}
        {user.profilePic && (
          <img
            src={user.profilePic}
            alt={user.name}
            className="w-24 h-24 rounded-full object-cover"
          />
        )}
      </div>

      <hr className="border-gray-700" />

      {/* Role-specific details */}
      {user.role !== Role.STUDENT && user.staff && (
        <div className="space-y-2">
          <h2 className="font-semibold">Staff Info</h2>
          <p>Position: {user.staff.position}</p>
        </div>
      )}

      {user.role === Role.STUDENT && user.student && (
        <div className="space-y-2">
          <h2 className="font-semibold">Student Info</h2>
          <p>Roll No: {user.student.rollNo}</p>
          <p>Section: {user.student.section?.name ?? "N/A"}</p>
          {user.student.parents?.length > 0 && (
            <p>Parents: {user.student.parents.map((p) => p.name).join(", ")}</p>
          )}
        </div>
      )}

      {user.role === Role.PARENT && user.parentOf?.length > 0 && (
        <div className="space-y-2">
          <h2 className="font-semibold">Children</h2>
          <ul className="list-disc list-inside">
            {user.parentOf.map((c) => (
              <li key={c.id}>{c.name}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Payments / Invoices */}
      {user.payments?.length > 0 && (
        <div className="space-y-2">
          <h2 className="font-semibold">Payments</h2>
          <ul className="list-disc list-inside">
            {user.payments.map((p) => (
              <li key={p.id}>
                {p.amount} ({p.paymentType}) - {p.status}
              </li>
            ))}
          </ul>
        </div>
      )}

      {user.invoices?.length > 0 && (
        <div className="space-y-2">
          <h2 className="font-semibold">Invoices</h2>
          <ul className="list-disc list-inside">
            {user.invoices.map((i) => (
              <li key={i.id}>
                {i.amount} - {i.status} -{" "}
                {new Date(i.createdAt).toLocaleDateString()}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
