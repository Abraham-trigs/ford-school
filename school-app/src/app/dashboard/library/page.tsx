"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import DataTable from "@/components/common/Datable";
import LibraryModal from "@/components/Library/LibraryModal";
import DeleteModal from "@/components/common/DeleteModal";
import LoaderModal from "@/components/common/LoaderModal";

export interface LibraryRecord {
  id?: string;
  title: string;
  author: string;
  isbn: string;
  copies: number;
}

export default function LibraryPage() {
  const [records, setRecords] = useState<LibraryRecord[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState<LibraryRecord | undefined>();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<LibraryRecord | null>(
    null
  );
  const [user, setUser] = useState<{ role: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get("/api/auth/me").then((res) => setUser(res.data.user));
  }, []);

  useEffect(() => {
    axios.get("/api/library").then((res) => setRecords(res.data));
  }, []);

  const handleCreate = () => setModalOpen(true);
  const handleEdit = (record: LibraryRecord) => {
    setRecordToEdit(record);
    setModalOpen(true);
  };
  const handleSuccess = (record: LibraryRecord) => {
    setRecords((prev) => {
      const index = prev.findIndex((r) => r.id === record.id);
      if (index > -1) {
        prev[index] = record;
        return [...prev];
      }
      return [record, ...prev];
    });
    toast.success("Library record saved!");
  };

  const handleDeleteClick = (record: LibraryRecord) => {
    setRecordToDelete(record);
    setDeleteModalOpen(true);
  };
  const handleConfirmDelete = async () => {
    if (!recordToDelete) return;
    setLoading(true);
    try {
      await axios.delete(`/api/library?id=${recordToDelete.id}`);
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
    { header: "Title", accessor: "title" },
    { header: "Author", accessor: "author" },
    { header: "ISBN", accessor: "isbn" },
    { header: "Copies", accessor: "copies" },
    {
      header: "Actions",
      accessor: "actions",
      render: (record: LibraryRecord) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(record)}
            className="px-3 py-1 bg-accentTeal text-background rounded"
          >
            Edit
          </button>
          {["ADMIN", "LIBRARIAN"].includes(user?.role || "") && (
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
        <h1 className="text-2xl font-display text-primary">Library</h1>
        {["ADMIN", "LIBRARIAN"].includes(user.role) && (
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-accentPurple text-background rounded hover:bg-purple0 transition-colors"
          >
            + Add Book
          </button>
        )}
      </div>

      <DataTable columns={columns} data={records} />

      <LibraryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleSuccess}
        recordToEdit={recordToEdit}
      />
      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        message={`Delete "${recordToDelete?.title}"?`}
      />
      <LoaderModal isVisible={loading} text="Processing..." />
    </div>
  );
}
