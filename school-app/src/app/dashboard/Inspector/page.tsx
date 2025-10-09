"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import DataTable from "@/components/common/Datable";
import InspectorModal from "@/components/Inspector/InspectorModal";
import DeleteModal from "@/components/common/DeleteModal";
import LoaderModal from "@/components/common/LoaderModal";
import { Inspector } from "@/types/Inspector";

export default function InspectorPage() {
  const [inspectors, setInspectors] = useState<Inspector[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [inspectorToEdit, setInspectorToEdit] = useState<
    Inspector | undefined
  >();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [inspectorToDelete, setInspectorToDelete] = useState<Inspector | null>(
    null
  );
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

    const fetchInspectors = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/api/inspectors");
        setInspectors(res.data);
      } catch (err: any) {
        toast.error(
          err.response?.data?.message || "Failed to fetch inspectors"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
    fetchInspectors();
  }, []);

  const handleCreate = () => {
    setInspectorToEdit(undefined);
    setModalOpen(true);
  };

  const handleEdit = (inspector: Inspector) => {
    setInspectorToEdit(inspector);
    setModalOpen(true);
  };

  const handleSuccess = (inspector: Inspector) => {
    setInspectors((prev) => {
      const index = prev.findIndex((i) => i.id === inspector.id);
      if (index > -1) {
        prev[index] = inspector;
        return [...prev];
      }
      return [inspector, ...prev];
    });
    toast.success(`${inspector.name} saved successfully!`);
  };

  const handleDeleteClick = (inspector: Inspector) => {
    setInspectorToDelete(inspector);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!inspectorToDelete) return;
    setLoading(true);
    try {
      await axios.delete(`/api/inspectors?id=${inspectorToDelete.id}`);
      setInspectors((prev) =>
        prev.filter((i) => i.id !== inspectorToDelete.id)
      );
      toast.success(`${inspectorToDelete.name} deleted successfully!`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete inspector");
    } finally {
      setInspectorToDelete(null);
      setLoading(false);
    }
  };

  if (!user) return <LoaderModal isVisible text="Loading user..." />;

  const columns = [
    { header: "Name", accessor: "name" },
    { header: "Department", accessor: "department" },
    { header: "Level", accessor: "level" },
    {
      header: "Actions",
      accessor: "actions",
      render: (inspector: Inspector) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(inspector)}
            className="px-3 py-1 bg-accentTeal text-background rounded"
          >
            Edit
          </button>
          {["ADMIN", "INSPECTOR"].includes(user.role) && (
            <button
              onClick={() => handleDeleteClick(inspector)}
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
        <h1 className="text-2xl font-display text-primary">Inspectors</h1>
        {["ADMIN", "INSPECTOR"].includes(user.role) && (
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-accentPurple text-background rounded hover:bg-purple0 transition-colors"
          >
            + Add Inspector
          </button>
        )}
      </div>

      <DataTable columns={columns} data={inspectors} />

      <InspectorModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleSuccess}
        inspectorToEdit={inspectorToEdit}
      />

      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        message={`Are you sure you want to delete "${inspectorToDelete?.name}"?`}
      />

      <LoaderModal isVisible={loading} text="Processing..." />
    </div>
  );
}
