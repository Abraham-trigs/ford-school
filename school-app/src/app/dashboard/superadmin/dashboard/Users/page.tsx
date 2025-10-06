"use client";

import UserTable from "./components/UserTable";
import { useUserStore } from "@/store/userStore";
import { useUserFilters } from "@/store/userFilters";

export default function UsersPage() {
  // Read from store only
  const { userList, loading, fetchUsers } = useUserStore();
  const filters = useUserFilters((state) => state); // subscribe to filters if needed

  return (
    <div className="p-6">
      <h1 className="text-2xl font-display text-deepPurple mb-6">
        Manage Users
      </h1>

      {loading ? (
        <p className="text-lightGray">Loading users...</p>
      ) : (
        <UserTable
          users={userList}
          onRefresh={fetchUsers} // optional, calls store action only
          onEdit={() => {}}
        />
      )}
    </div>
  );
}
