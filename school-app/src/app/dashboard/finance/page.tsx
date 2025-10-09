"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import DataTable from "@/components/common/Datable";
import FinanceModal from "@/components/Finance/FinanceModal";
import DeleteModal from "@/components/common/DeleteModal";
import LoaderModal from "@/components/layout/LoaderModal";

export interface FinanceRecord {
  id?: string;
  type: string;
  amount: number;
  description: string;
  date: string;
}

export interface User {
  id: string;
  role: string;
  schoolId: string;
}

export default function FinancePage() {
  const [records, setRecords] = useState<FinanceRecord[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState<FinanceRecord | undefined>();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<FinanceRecord | null>(
    null
  );
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
    const fetchRecords = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/api/finance");
        setRecords(res.data);
      } catch (err: any) {
        toast.error(
          err.response?.data?.message || "Failed to fetch finance records"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, []);

  const handleCreate = () => {
    setRecordToEdit(undefined);
    setModalOpen(true);
  };

  const handleEdit = (record: FinanceRecord) => {
    setRecordToEdit(record);
    setModalOpen(true);
  };

  const handleSuccess = (record: FinanceRecord) => {
    setRecords((prev) => {
      const index = prev.findIndex((r) => r.id === record.id);
      if (index > -1) {
        prev[index] = record;
        return [...prev];
      }
      return [record, ...prev];
    });
    toast.success("Finance record saved successfully!");
  };

  const handleDeleteClick = (record: FinanceRecord) => {
    setRecordToDelete(record);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!recordToDelete) return;
    setLoading(true);
    try {
      await axios.delete(`/api/finance?id=${recordToDelete.id}`);
      setRecords((prev) => prev.filter((r) => r.id !== recordToDelete.id));
      toast.success("Finance record deleted successfully!");
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to delete finance record"
      );
    } finally {
      setRecordToDelete(null);
      setLoading(false);
    }
  };

  if (!user)
    return <LoaderModal isVisible={true} text="Loading finance records..." />;

  const columns = [
    { header: "Type", accessor: "type" },
    { header: "Amount", accessor: "amount" },
    { header: "Description", accessor: "description" },
    { header: "Date", accessor: "date" },
    {
      header: "Actions",
      accessor: "actions",
      render: (record: FinanceRecord) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(record)}
            className="px-3 py-1 bg-accentTeal text-background rounded"
          >
            Edit
          </button>
          {["ADMIN", "PRINCIPAL", "ACCOUNTANT"].includes(user.role) && (
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

  return (
    <div className="p-6 bg-background min-h-full rounded-lg shadow">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-display text-primary">Finance</h1>
        {["ADMIN", "PRINCIPAL", "ACCOUNTANT"].includes(user.role) && (
          <button
            className="px-4 py-2 bg-accentPurple text-background rounded hover:bg-purple0 transition-colors"
            onClick={handleCreate}
          >
            + Add Record
          </button>
        )}
      </div>

      <DataTable columns={columns} data={records} />

      <FinanceModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleSuccess}
        recordToEdit={recordToEdit}
      />

      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        message={`Are you sure you want to delete "${recordToDelete?.type}"?`}
      />

      <LoaderModal isVisible={loading} text="Processing..." />
    </div>
  );
}
