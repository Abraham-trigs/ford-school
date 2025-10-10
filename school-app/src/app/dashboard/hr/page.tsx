"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import DataTable from "@/components/common/Datable";
import HRModal from "@/components/HR/HRModal";
import DeleteModal from "@/components/common/DeleteModal";
import LoaderModal from "@/components/common/LoaderModal";

export interface HR {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  department?: string;
  role?: string;
}

export interface User {
  id: string;
  role: string;
  schoolId: string;
}

export default function HRPage() {
  const [hrs, setHRs] = useState<HR[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [hrToEdit, setHRToEdit] = useState<HR | undefined>();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [hrToDelete, setHRToDelete] = useState<HR | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/api/auth/me");
        setUser(res.data.user);
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to load user");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // Fetch HR records
  useEffect(() => {
    const fetchHRs = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/api/hr");
        setHRs(res.data);
      } catch (err: any) {
        toast.error(
          err.response?.data?.message || "Failed to fetch HR records"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchHRs();
  }, []);

  const handleCreate = () => {
    setHRToEdit(undefined);
    setModalOpen(true);
  };

  const handleEdit = (hr: HR) => {
    setHRToEdit(hr);
    setModalOpen(true);
  };

  const handleSuccess = (hr: HR) => {
    setHRs((prev) => {
      const index = prev.findIndex((h) => h.id === hr.id);
      if (index > -1) {
        prev[index] = hr;
        return [...prev];
      }
      return [hr, ...prev];
    });
    toast.success(`HR ${hr.name} saved successfully!`);
  };

  const handleDeleteClick = (hr: HR) => {
    setHRToDelete(hr);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!hrToDelete) return;
    setLoading(true);
    try {
      await axios.delete(`/api/hr?id=${hrToDelete.id}`);
      setHRs((prev) => prev.filter((h) => h.id !== hrToDelete.id));
      toast.success(`HR ${hrToDelete.name} deleted successfully!`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete HR");
    } finally {
      setHRToDelete(null);
      setLoading(false);
    }
  };

  if (!user) return <LoaderModal isVisible={true} text="Loading user..." />;

  const columns = [
    { header: "Name", accessor: "name" },
    { header: "Email", accessor: "email" },
    { header: "Phone", accessor: "phone" },
    { header: "Department", accessor: "department" },
    { header: "Role", accessor: "role" },
    {
      header: "Actions",
      accessor: "actions",
      render: (hr: HR) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(hr)}
            className="px-3 py-1 bg-accentTeal text-background rounded"
          >
            Edit
          </button>
          {["ADMIN", "PRINCIPAL", "HR"].includes(user.role) && (
            <button
              onClick={() => handleDeleteClick(hr)}
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
        <h1 className="text-2xl font-display text-primary">HR Records</h1>
        {["ADMIN", "PRINCIPAL", "HR"].includes(user.role) && (
          <button
            className="px-4 py-2 bg-accentPurple text-background rounded hover:bg-purple0 transition-colors"
            onClick={handleCreate}
          >
            + Add HR
          </button>
        )}
      </div>

      <DataTable columns={columns} data={hrs} />

      <HRModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleSuccess}
        hrToEdit={hrToEdit}
      />

      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        message={`Are you sure you want to delete "${hrToDelete?.name}"?`}
      />

      <LoaderModal isVisible={loading} text="Processing..." />
    </div>
  );
}
