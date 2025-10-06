"use client";

import { useUserStore, User } from "@/store/userStore";

interface UserTableProps {
  onEdit: (user: User) => void;
}

export default function UserTable({ onEdit }: UserTableProps) {
  const { userList, loading, fetchUsers } = useUserStore();

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete user");

      // Refresh store after deletion
      await fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Failed to delete user. Please try again.");
    }
  };

  if (loading) return <p className="text-lightGray">Loading users...</p>;
  if (!userList.length)
    return <p className="text-lightGray">No users found.</p>;

  return (
    <table className="w-full border-collapse text-left">
      <thead>
        <tr className="bg-deepPurple text-secondary">
          <th className="p-3">ID</th>
          <th className="p-3">Name</th>
          <th className="p-3">Email</th>
          <th className="p-3">Role</th>
          <th className="p-3">Actions</th>
        </tr>
      </thead>
      <tbody>
        {userList.map((user) => (
          <tr key={user.id} className="border-b border-secondary">
            <td className="p-3">{user.id}</td>
            <td className="p-3">{user.fullName || "-"}</td>
            <td className="p-3">{user.email}</td>
            <td className="p-3">{user.roles.join(", ")}</td>
            <td className="p-3 flex gap-2">
              <button
                onClick={() => onEdit(user)}
                className="px-3 py-1 bg-accentPurple text-secondary rounded hover:bg-accentTeal"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(user.id)}
                className="px-3 py-1 bg-error text-lightGray rounded hover:bg-errorPink"
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
