"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import DataTable from "@/components/common/Datable";
import CleaningModal from "@/components/Cleaning/CleaningModal";
import DeleteModal from "@/components/common/DeleteModal";
import LoaderModal from "@/components/layout/LoaderModal";

export interface Cleaner {
  id?: string;
  name: string;
  shift: string;
  area: string;
}

export default function CleaningPage() {
  const [records, setRecords] = useState<Cleaner[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState<Cleaner | undefined>();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<Cleaner | null>(null);
  const [user, setUser] = useState<{ role: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get("/api/auth/me").then((res) => setUser(res.data.user));
    axios.get("/api/cleaning").then((res) => setRecords(res.data));
  }, []);

  const handleCreate = () => setModalOpen(true);
  const handleEdit = (record: Cleaner) => {
    setRecordToEdit(record);
    setModalOpen(true);
  };
  const handleSuccess = (record: Cleaner) => {
    setRecords((prev) => {
      const index = prev.findIndex((r) => r.id === record.id);
      if (index > -1) {
        prev[index] = record;
        return [...prev];
      }
      return [record, ...prev];
    });
    toast.success("Saved successfully!");
  };

  const handleDeleteClick = (record: Cleaner) => {
    setRecordToDelete(record);
    setDeleteModalOpen(true);
  };
  const handleConfirmDelete = async () => {
    if (!recordToDelete) return;
    setLoading(true);
    try {
      await axios.delete(`/api/cleaning?id=${recordToDelete.id}`);
      setRecords((prev) => prev.filter((r) => r.id !== recordToDelete.id));
      toast.success("Deleted successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Delete failed");
    } finally {
      setRecordToDelete(null);
      setLoading(false);
    }
  };

  const columns = [
    { header: "Name", accessor: "name" },
    { header: "Shift", accessor: "shift" },
    { header: "Area", accessor: "area" },
    {
      header: "Actions",
      accessor: "actions",
      render: (record: Cleaner) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(record)}
            className="px-3 py-1 bg-accentTeal text-background rounded"
          >
            Edit
          </button>
          {["ADMIN", "CLEANING"].includes(user?.role || "") && (
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

  if (!user) return <LoaderModal isVisible text="Loading..." />;

  return (
    <div className="p-6 bg-background min-h-full rounded-lg shadow">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-display text-primary">Cleaning</h1>
        {["ADMIN", "CLEANING"].includes(user.role) && (
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-accentPurple text-background rounded hover:bg-purple0 transition-colors"
          >
            + Add Cleaner
          </button>
        )}
      </div>

      <DataTable columns={columns} data={records} />
      <CleaningModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleSuccess}
        recordToEdit={recordToEdit}
      />
      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        message={`Delete "${recordToDelete?.name}"?`}
      />
      <LoaderModal isVisible={loading} text="Processing..." />
    </div>
  );
}
