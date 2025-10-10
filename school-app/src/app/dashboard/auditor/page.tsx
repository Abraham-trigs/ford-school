"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import DataTable from "@/components/common/Datable";
import AuditorModal from "@/components/Auditor/AuditorModal";
import DeleteModal from "@/components/common/DeleteModal";
import LoaderModal from "@/components/common/LoaderModal";
import { Auditor } from "@/types/Auditor";

export default function AuditorPage() {
  const [auditors, setAuditors] = useState<Auditor[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [auditorToEdit, setAuditorToEdit] = useState<Auditor | undefined>();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [auditorToDelete, setAuditorToDelete] = useState<Auditor | null>(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<{ role: string } | null>(null);

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

    const fetchAuditors = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/api/auditors");
        setAuditors(res.data);
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to fetch auditors");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
    fetchAuditors();
  }, []);

  const handleCreate = () => {
    setAuditorToEdit(undefined);
    setModalOpen(true);
  };

  const handleEdit = (auditor: Auditor) => {
    setAuditorToEdit(auditor);
    setModalOpen(true);
  };

  const handleSuccess = (auditor: Auditor) => {
    setAuditors((prev) => {
      const index = prev.findIndex((a) => a.id === auditor.id);
      if (index > -1) {
        prev[index] = auditor;
        return [...prev];
      }
      return [auditor, ...prev];
    });
    toast.success(`${auditor.name} saved successfully!`);
  };

  const handleDeleteClick = (auditor: Auditor) => {
    setAuditorToDelete(auditor);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!auditorToDelete) return;
    setLoading(true);
    try {
      await axios.delete(`/api/auditors?id=${auditorToDelete.id}`);
      setAuditors((prev) => prev.filter((a) => a.id !== auditorToDelete.id));
      toast.success(`${auditorToDelete.name} deleted successfully!`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete auditor");
    } finally {
      setAuditorToDelete(null);
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
      render: (auditor: Auditor) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(auditor)}
            className="px-3 py-1 bg-accentTeal text-background rounded"
          >
            Edit
          </button>
          {["ADMIN", "AUDITOR"].includes(user.role) && (
            <button
              onClick={() => handleDeleteClick(auditor)}
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
        <h1 className="text-2xl font-display text-primary">Auditors</h1>
        {["ADMIN", "AUDITOR"].includes(user.role) && (
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-accentPurple text-background rounded hover:bg-purple0 transition-colors"
          >
            + Add Auditor
          </button>
        )}
      </div>

      <DataTable columns={columns} data={auditors} />

      <AuditorModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleSuccess}
        auditorToEdit={auditorToEdit}
      />

      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        message={`Are you sure you want to delete "${auditorToDelete?.name}"?`}
      />

      <LoaderModal isVisible={loading} text="Processing..." />
    </div>
  );
}
