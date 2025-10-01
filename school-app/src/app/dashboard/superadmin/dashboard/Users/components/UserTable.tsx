export default function UserTable({
  users,
  onRefresh,
  onEdit,
}: UserTableProps & { onEdit: (user: User) => void }) {
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    await fetch(`/api/users/${id}`, { method: "DELETE" });
    onRefresh();
  };

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
        {users.map((user) => (
          <tr key={user.id} className="border-b border-secondary">
            <td className="p-3">{user.id}</td>
            <td className="p-3">{user.name || "-"}</td>
            <td className="p-3">{user.email}</td>
            <td className="p-3">{user.role}</td>
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
