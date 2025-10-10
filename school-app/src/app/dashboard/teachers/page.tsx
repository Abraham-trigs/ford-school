"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import DataTable from "@/components/common/Datable";
import TeacherModal from "@/components/Teacher/TeacherModal";
import DeleteModal from "@/components/common/DeleteModal";
import LoaderModal from "@/components/common/LoaderModal";
import { Teacher } from "@/types/Teacher";

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [teacherToEdit, setTeacherToEdit] = useState<Teacher | undefined>();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<{ role: string } | null>(null);

  // fetch user
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

  // fetch teachers
  useEffect(() => {
    const fetchTeachers = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/api/teachers");
        setTeachers(res.data);
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to fetch teachers");
      } finally {
        setLoading(false);
      }
    };
    fetchTeachers();
  }, []);

  const handleCreate = () => {
    setTeacherToEdit(undefined);
    setModalOpen(true);
  };

  const handleEdit = (teacher: Teacher) => {
    setTeacherToEdit(teacher);
    setModalOpen(true);
  };

  const handleSuccess = (teacher: Teacher) => {
    setTeachers((prev) => {
      const idx = prev.findIndex((t) => t.id === teacher.id);
      if (idx > -1) {
        prev[idx] = teacher;
        return [...prev];
      }
      return [teacher, ...prev];
    });
    toast.success(`Teacher ${teacher.firstName} saved successfully!`);
  };

  const handleDeleteClick = (teacher: Teacher) => {
    setTeacherToDelete(teacher);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!teacherToDelete) return;
    setLoading(true);
    try {
      await axios.delete(`/api/teachers?id=${teacherToDelete.id}`);
      setTeachers((prev) => prev.filter((t) => t.id !== teacherToDelete.id));
      toast.success(
        `Teacher ${teacherToDelete.firstName} deleted successfully!`
      );
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete teacher");
    } finally {
      setTeacherToDelete(null);
      setLoading(false);
    }
  };

  if (!user) return <LoaderModal isVisible={true} text="Loading user..." />;

  const columns = [
    { header: "First Name", accessor: "firstName" },
    { header: "Last Name", accessor: "lastName" },
    { header: "Email", accessor: "email" },
    { header: "Role", accessor: "role" },
    { header: "Subjects", accessor: "subjects" },
    { header: "Classes", accessor: "classes" },
    {
      header: "Actions",
      accessor: "actions",
      render: (teacher: Teacher) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(teacher)}
            className="px-3 py-1 bg-accentTeal text-background rounded"
          >
            Edit
          </button>
          {["ADMIN", "HEAD_TEACHER"].includes(user.role) && (
            <button
              onClick={() => handleDeleteClick(teacher)}
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
        <h1 className="text-2xl font-display text-primary">Teachers</h1>
        {["ADMIN", "HEAD_TEACHER"].includes(user.role) && (
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-accentPurple text-background rounded hover:bg-purple0 transition-colors"
          >
            + Add Teacher
          </button>
        )}
      </div>

      <DataTable columns={columns} data={teachers} />
      <TeacherModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleSuccess}
        teacherToEdit={teacherToEdit}
      />
      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        message={`Are you sure you want to delete "${teacherToDelete?.firstName} ${teacherToDelete?.lastName}"?`}
      />
      <LoaderModal isVisible={loading} text="Processing..." />
    </div>
  );
}
