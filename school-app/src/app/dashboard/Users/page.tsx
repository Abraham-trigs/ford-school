// app/dashboard/users/page.tsx
"use client";

import { useEffect, useState } from "react";
import UserTable from "./components/UserTable";

interface User {
  id: number;
  name?: string;
  email: string;
  role: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    const res = await fetch("/api/users");
    const data = await res.json();
    setUsers(data.users || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-display text-deepPurple mb-6">
        Manage Users
      </h1>

      {loading ? (
        <p className="text-lightGray">Loading users...</p>
      ) : (
        <UserTable users={users} onRefresh={fetchUsers} />
      )}
    </div>
  );
}
