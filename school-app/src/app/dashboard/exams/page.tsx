"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import DataTable from "@/components/common/Datable";
import ExamsModal from "@/components/exams/ExamsModal";
import DeleteModal from "@/components/common/DeleteModal";
import LoaderModal from "@/components/common/LoaderModal";

export interface Exam {
  id?: string;
  name: string;
  class: string;
  subject: string;
  date: string;
}

export interface User {
  id: string;
  role: string;
  schoolId: string;
}

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [examToEdit, setExamToEdit] = useState<Exam | undefined>();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [examToDelete, setExamToDelete] = useState<Exam | null>(null);
  const [user, setUser] = useState<User | null>(null);
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
      const index = prev.findIndex((e) => e.id === exam.id);
      if (index > -1) {
        prev[index] = exam;
        return [...prev];
      }
      return [exam, ...prev];
    });
    toast.success("Exam saved successfully!");
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
      toast.success("Exam deleted successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete exam");
    } finally {
      setExamToDelete(null);
      setLoading(false);
    }
  };

  if (!user) return <LoaderModal isVisible={true} text="Loading exams..." />;

  const columns = [
    { header: "Name", accessor: "name" },
    { header: "Class", accessor: "class" },
    { header: "Subject", accessor: "subject" },
    { header: "Date", accessor: "date" },
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
          {[
            "ADMIN",
            "PRINCIPAL",
            "VICE_PRINCIPAL",
            "TEACHER",
            "EXAM_OFFICER",
          ].includes(user.role) && (
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
        {[
          "ADMIN",
          "PRINCIPAL",
          "VICE_PRINCIPAL",
          "TEACHER",
          "EXAM_OFFICER",
        ].includes(user.role) && (
          <button
            className="px-4 py-2 bg-accentPurple text-background rounded hover:bg-purple0 transition-colors"
            onClick={handleCreate}
          >
            + Add Exam
          </button>
        )}
      </div>

      <DataTable columns={columns} data={exams} />

      <ExamsModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleSuccess}
        examToEdit={examToEdit}
      />

      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        message={`Are you sure you want to delete "${examToDelete?.name}"?`}
      />

      <LoaderModal isVisible={loading} text="Processing..." />
    </div>
  );
}
