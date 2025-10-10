"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import DataTable from "@/components/common/Datable";
import ExamModal from "@/components/exams/ExamModal";
import DeleteModal from "@/components/common/DeleteModal";
import LoaderModal from "@/components/common/LoaderModal";
import { Exam } from "@/types/Exam";

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [examToEdit, setExamToEdit] = useState<Exam | undefined>();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [examToDelete, setExamToDelete] = useState<Exam | null>(null);
  const [user, setUser] = useState<{ role: string } | null>(null);
  const [loading, setLoading] = useState(false);

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
    const fetchExams = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/api/exams");
        setExams(res.data);
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to fetch exams");
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  const handleCreate = () => {
    setExamToEdit(undefined);
    setModalOpen(true);
  };

  const handleEdit = (exam: Exam) => {
    setExamToEdit(exam);
    setModalOpen(true);
  };

  const handleSuccess = (exam: Exam) => {
    setExams((prev) => {
      const idx = prev.findIndex((e) => e.id === exam.id);
      if (idx > -1) {
        prev[idx] = exam;
        return [...prev];
      }
      return [exam, ...prev];
    });
    toast.success(`Exam ${exam.title} saved successfully!`);
  };

  const handleDeleteClick = (exam: Exam) => {
    setExamToDelete(exam);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!examToDelete) return;
    setLoading(true);
    try {
      await axios.delete(`/api/exams?id=${examToDelete.id}`);
      setExams((prev) => prev.filter((e) => e.id !== examToDelete.id));
      toast.success(`Exam ${examToDelete.title} deleted successfully!`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete exam");
    } finally {
      setExamToDelete(null);
      setLoading(false);
    }
  };

  if (!user) return <LoaderModal isVisible text="Loading user..." />;

  const columns = [
    { header: "Title", accessor: "title" },
    { header: "Description", accessor: "description" },
    { header: "Date", accessor: "date" },
    { header: "Class ID", accessor: "classId" },
    {
      header: "Actions",
      accessor: "actions",
      render: (exam: Exam) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(exam)}
            className="px-3 py-1 bg-accentTeal text-background rounded"
          >
            Edit
          </button>
          {["ADMIN", "PRINCIPAL", "TEACHER"].includes(user.role) && (
            <button
              onClick={() => handleDeleteClick(exam)}
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
        <h1 className="text-2xl font-display text-primary">Exams</h1>
        {["ADMIN", "PRINCIPAL", "TEACHER"].includes(user.role) && (
          <button
            className="px-4 py-2 bg-accentPurple text-background rounded hover:bg-purple0 transition-colors"
            onClick={handleCreate}
          >
            + Add Exam
          </button>
        )}
      </div>

      <DataTable columns={columns} data={exams} />
      <ExamModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleSuccess}
        examToEdit={examToEdit}
      />
      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        message={`Are you sure you want to delete "${examToDelete?.title}"?`}
      />
      <LoaderModal isVisible={loading} text="Processing..." />
    </div>
  );
}
