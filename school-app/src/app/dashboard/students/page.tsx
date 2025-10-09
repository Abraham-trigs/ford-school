"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import DataTable from "@/components/common/Datable";
import StudentModal from "@/components/Students/StudentsModal";
import DeleteModal from "@/components/common/DeleteModal";
import LoaderModal from "@/components/common/LoaderModal";

export interface Student {
  id?: string;
  name: string;
  class: string;
  age: number;
  parent: string;
}

export interface User {
  id: string;
  role: string;
  schoolId: string;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | undefined>();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
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

  // Fetch students
  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/api/students");
        setStudents(res.data);
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to fetch students");
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const handleCreate = () => {
    setStudentToEdit(undefined);
    setModalOpen(true);
  };

  const handleEdit = (student: Student) => {
    setStudentToEdit(student);
    setModalOpen(true);
  };

  const handleSuccess = (student: Student) => {
    setStudents((prev) => {
      const index = prev.findIndex((s) => s.id === student.id);
      if (index > -1) {
        prev[index] = student;
        return [...prev];
      }
      return [student, ...prev];
    });
    toast.success(`Student ${student.name} saved successfully!`);
  };

  const handleDeleteClick = (student: Student) => {
    setStudentToDelete(student);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!studentToDelete) return;
    setLoading(true);
    try {
      await axios.delete(`/api/students?id=${studentToDelete.id}`);
      setStudents((prev) => prev.filter((s) => s.id !== studentToDelete.id));
      toast.success(`Student ${studentToDelete.name} deleted successfully!`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete student");
    } finally {
      setStudentToDelete(null);
      setLoading(false);
    }
  };

  if (!user) return <LoaderModal isVisible={true} text="Loading user..." />;

  const columns = [
    { header: "Name", accessor: "name" },
    { header: "Class", accessor: "class" },
    { header: "Age", accessor: "age" },
    { header: "Parent", accessor: "parent" },
    {
      header: "Actions",
      accessor: "actions",
      render: (student: Student) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(student)}
            className="px-3 py-1 bg-accentTeal text-background rounded"
          >
            Edit
          </button>
          {["ADMIN", "PRINCIPAL", "TEACHER"].includes(user.role) && (
            <button
              onClick={() => handleDeleteClick(student)}
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
        <h1 className="text-2xl font-display text-primary">Students</h1>
        {["ADMIN", "PRINCIPAL", "TEACHER"].includes(user.role) && (
          <button
            className="px-4 py-2 bg-accentPurple text-background rounded hover:bg-purple0 transition-colors"
            onClick={handleCreate}
          >
            + Add Student
          </button>
        )}
      </div>

      <DataTable columns={columns} data={students} />

      <StudentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleSuccess}
        studentToEdit={studentToEdit}
      />

      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        message={`Are you sure you want to delete "${studentToDelete?.name}"?`}
      />

      <LoaderModal isVisible={loading} text="Processing..." />
    </div>
  );
}
