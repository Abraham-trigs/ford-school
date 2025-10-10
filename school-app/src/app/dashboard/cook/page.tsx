"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import DataTable from "@/components/common/Datable";
import CookStaffModal from "@/components/Cook/CookStaffModal";
import DeleteModal from "@/components/common/DeleteModal";
import LoaderModal from "@/components/common/LoaderModal";
import { CookStaff } from "@/types/cookStaff";

export default function CookStaffPage() {
  const [records, setRecords] = useState<CookStaff[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState<CookStaff | undefined>();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<CookStaff | null>(null);
  const [user, setUser] = useState<{ role: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/api/auth/me");
        setUser(res.data.user);
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to fetch user");
      } finally {
        setLoading(false);
      }
    };

    const fetchRecords = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/api/cook");
        setRecords(res.data);
      } catch (err: any) {
        toast.error(
          err.response?.data?.message || "Failed to fetch Cook Staff"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
    fetchRecords();
  }, []);

  const handleCreate = () => {
    setRecordToEdit(undefined);
    setModalOpen(true);
  };

  const handleEdit = (record: CookStaff) => {
    setRecordToEdit(record);
    setModalOpen(true);
  };

  const handleSuccess = (record: CookStaff) => {
    setRecords((prev) => {
      const index = prev.findIndex((r) => r.id === record.id);
      if (index > -1) {
        prev[index] = record;
        return [...prev];
      }
      return [record, ...prev];
    });
    toast.success(`${record.name} saved successfully!`);
  };

  const handleDeleteClick = (record: CookStaff) => {
    setRecordToDelete(record);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!recordToDelete) return;
    setLoading(true);
    try {
      await axios.delete(`/api/cook?id=${recordToDelete.id}`);
      setRecords((prev) => prev.filter((r) => r.id !== recordToDelete.id));
      toast.success(`${recordToDelete.name} deleted successfully!`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete record");
    } finally {
      setRecordToDelete(null);
      setLoading(false);
    }
  };

  if (!user) return <LoaderModal isVisible text="Loading user..." />;

  const columns = [
    { header: "Name", accessor: "name" },
    { header: "Email", accessor: "email" },
    { header: "Phone", accessor: "phone" },
    { header: "Shift", accessor: "shift" },
    { header: "Specialization", accessor: "specialization" },
    {
      header: "Actions",
      accessor: "actions",
      render: (record: CookStaff) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(record)}
            className="px-3 py-1 bg-accentTeal text-background rounded"
          >
            Edit
          </button>
          {["ADMIN", "PRINCIPAL"].includes(user.role) && (
            <button
              onClick={() => handleDeleteClick(record)}
              className="px-3 py-1 bg-error text-background rounded hover:bg-errorPink transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 bg-background min-h-full rounded-lg shadow">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-display text-primary">Cook Staff</h1>
        {["ADMIN", "PRINCIPAL"].includes(user.role) && (
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-accentPurple text-background rounded hover:bg-purple0 transition-colors"
          >
            + Add Staff
          </button>
        )}
      </div>

      <DataTable columns={columns} data={records} />

      <CookStaffModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleSuccess}
        staffToEdit={recordToEdit}
      />

      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        message={`Are you sure you want to delete "${recordToDelete?.name}"?`}
      />

      <LoaderModal isVisible={loading} text="Processing..." />
    </div>
  );
}
