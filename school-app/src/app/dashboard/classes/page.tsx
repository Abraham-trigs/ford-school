"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import DataTable from "@/components/common/Datable";
import ClassModal from "@/components/Classes/ClassModal";
import DeleteModal from "@/components/common/DeleteModal";
import LoaderModal from "@/components/common/LoaderModal";
import { Class } from "@/types/Class";

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [classToEdit, setClassToEdit] = useState<Class | undefined>();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState<Class | null>(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<{ role: string } | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("/api/auth/me");
        setUser(res.data.user);
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to load user");
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchClasses = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/api/classes");
        setClasses(res.data);
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to fetch classes");
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  const handleCreate = () => {
    setClassToEdit(undefined);
    setModalOpen(true);
  };

  const handleEdit = (cls: Class) => {
    setClassToEdit(cls);
    setModalOpen(true);
  };

  const handleSuccess = (cls: Class) => {
    setClasses((prev) => {
      const idx = prev.findIndex((c) => c.id === cls.id);
      if (idx > -1) {
        prev[idx] = cls;
        return [...prev];
      }
      return [cls, ...prev];
    });
    toast.success(`Class ${cls.name} saved successfully!`);
  };

  const handleDeleteClick = (cls: Class) => {
    setClassToDelete(cls);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!classToDelete) return;
    setLoading(true);
    try {
      await axios.delete(`/api/classes?id=${classToDelete.id}`);
      setClasses((prev) => prev.filter((c) => c.id !== classToDelete.id));
      toast.success(`Class ${classToDelete.name} deleted successfully!`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete class");
    } finally {
      setClassToDelete(null);
      setLoading(false);
    }
  };

  if (!user) return <LoaderModal isVisible={true} text="Loading user..." />;

  const columns = [
    { header: "Name", accessor: "name" },
    { header: "Level", accessor: "level" },
    { header: "Teacher ID", accessor: "teacherId" },
    {
      header: "Actions",
      accessor: "actions",
      render: (cls: Class) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(cls)}
            className="px-3 py-1 bg-accentTeal text-background rounded"
          >
            Edit
          </button>
          {["ADMIN", "HEAD_TEACHER"].includes(user.role) && (
            <button
              onClick={() => handleDeleteClick(cls)}
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
        <h1 className="text-2xl font-display text-primary">Classes</h1>
        {["ADMIN", "HEAD_TEACHER"].includes(user.role) && (
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-accentPurple text-background rounded hover:bg-purple0 transition-colors"
          >
            + Add Class
          </button>
        )}
      </div>

      <DataTable columns={columns} data={classes} />
      <ClassModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleSuccess}
        classToEdit={classToEdit}
      />
      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        message={`Are you sure you want to delete "${classToDelete?.name}"?`}
      />
      <LoaderModal isVisible={loading} text="Processing..." />
    </div>
  );
}
