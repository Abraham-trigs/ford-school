// src/components/SuperAdmin/SuperadminDashboardClient.tsx
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import DataTable from "@/components/common/Datable";
import ActionButtons from "@/components/common/ActionButtons";
import CrudModal from "@/components/common/CrudModal";
import DeleteModal from "@/components/common/DeleteModal";
import LoaderModal from "@/components/common/LoaderModal";

import { School } from "@/types/superAdmin";
import { useUserStore } from "@/store/userStore";

export default function SuperadminDashboardClient() {
  const user = useUserStore((state) => state.user);

  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [schoolToEdit, setSchoolToEdit] = useState<School | null>(null);
  const [schoolToDelete, setSchoolToDelete] = useState<School | null>(null);

  // Fetch schools
  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/superadmin");
      setSchools(res.data);
    } catch {
      toast.error("Failed to load schools");
    } finally {
      setLoading(false);
    }
  };

  // Handlers
  const handleCreate = () => {
    setSchoolToEdit(null);
    setModalOpen(true);
  };

  const handleEdit = (school: School) => {
    setSchoolToEdit(school);
    setModalOpen(true);
  };

  const handleDeleteClick = (school: School) => {
    setSchoolToDelete(school);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!schoolToDelete) return;
    setLoading(true);
    try {
      await axios.delete(`/api/superadmin?id=${schoolToDelete.id}`);
      setSchools((prev) => prev.filter((s) => s.id !== schoolToDelete.id));
      toast.success("Deleted successfully!");
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleteModalOpen(false);
      setSchoolToDelete(null);
      setLoading(false);
    }
  };

  const columns = [
    { key: "name", label: "School Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "address", label: "Address" },
  ];

  if (!user) return <LoaderModal isVisible={true} text="Loading user..." />;

  return (
    <div className="p-6 bg-background min-h-full rounded-lg shadow space-y-6">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-display text-primary">Schools</h1>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-accentPurple text-background rounded hover:bg-purple0 transition-colors"
        >
          + Add School
        </button>
      </div>

      <DataTable
        data={schools}
        columns={columns}
        actions={(school: School) => (
          <ActionButtons
            onEdit={() => handleEdit(school)}
            onDelete={() => handleDeleteClick(school)}
          />
        )}
      />

      <CrudModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={schoolToEdit ? "Edit School" : "Add School"}
      >
        {/* School form component goes here */}
      </CrudModal>

      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        message={`Delete "${schoolToDelete?.name}"?`}
      />

      <LoaderModal isVisible={loading} text="Processing..." />
    </div>
  );
}
