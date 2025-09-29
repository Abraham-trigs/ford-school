// app/dashboard/users/page.tsx
"use client";

import { useEffect, useState } from "react";
import UserTable from "./components/UserTable";
import UserModal from "./components/UserModal";

interface User {
  id: number;
  name?: string;
  email: string;
  role: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | undefined>(undefined);

  const fetchUsers = async () => {
    setLoading(true);
    const res = await fetch("/api/users");
    const data = await res.json();
    setUsers(data.users || []);
    setLoading(false);
  };

  const handleEdit = (user: User) => {
    setEditUser(user);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setEditUser(undefined);
    setModalOpen(true);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-display text-deepPurple">Manage Users</h1>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-accentTeal text-deepPurple rounded hover:bg-accentPurple transition-colors duration-200"
        >
          Create User
        </button>
      </div>

      {loading ? (
        <p className="text-lightGray">Loading users...</p>
      ) : (
        <UserTable users={users} onRefresh={fetchUsers} onEdit={handleEdit} />
      )}

      <UserModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={fetchUsers}
        user={editUser}
      />
    </div>
  );
}
