"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import DataTable from "@/components/common/Datable";
import FinanceModal from "@/components/Finance/FinanceModal";
import DeleteModal from "@/components/common/DeleteModal";
import LoaderModal from "@/components/common/LoaderModal";
import { FinanceRecord } from "@/types/finance";
import FinanceChart from "./FinanceChart";
import FinanceTrendChart from "./FinanceTrendChart";
import FinanceSummary from "./FinanceSummary";
import FinanceAnalytics from "./FinanceAnalytics";
import FinanceFilterBar from "./FinanceFilterBar";
import FinanceInsights from "@/features/finance/components/FinanceInsights";
import FinanceInsightBox from "@/features/finance/components/FinanceInsightBox";

interface User {
  id: string;
  role: string;
  schoolId: string;
}

export default function FinanceDashboard() {
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
      try {
        const res = await axios.get("/api/auth/me");
        setUser(res.data.user);
      } catch {
        toast.error("Failed to load user");
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
      } catch {
        toast.error("Failed to fetch finance records");
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

  useEffect(() => {
    setFilteredRecords(records);
  }, [records]);

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
    toast.success("Saved successfully!");
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
      toast.success("Deleted successfully!");
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleteModalOpen(false);
      setRecordToDelete(null);
      setLoading(false);
    }
  };

  if (!user) return <LoaderModal isVisible text="Loading user..." />;

  const columns = [
    { header: "Type", accessor: "type" },
    { header: "Amount", accessor: "amount" },
    { header: "Date", accessor: "date" },
    { header: "Description", accessor: "description" },
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
          {["ADMIN", "PRINCIPAL", "FINANCE"].includes(user.role) && (
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
        <h1 className="text-2xl font-display text-primary">Finance Records</h1>
        {["ADMIN", "PRINCIPAL", "FINANCE"].includes(user.role) && (
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-accentPurple text-background rounded hover:bg-purple0 transition-colors"
          >
            + Add Record
          </button>
        )}
      </div>

      {/* FINANCE */}
      <div className="space-y-4">
        <FinanceSummary records={filteredRecords} />

        <FinanceFilterBar
          records={records}
          onFilter={(filtered) => setFilteredRecords(filtered)}
        />

        <DataTable columns={columns} data={filteredRecords} />
      </div>

      <FinanceInsightBox />
      <FinanceInsights records={filteredRecords} />
      {/* CHARTS */}
      <FinanceSummary records={records} />
      <FinanceSummary records={filteredRecords} />
      {/* NEW */}
      <FinanceAnalytics records={records} />
      <FinanceTrendChart records={records} />
      <FinanceChart records={records} />

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
        message={`Delete "${recordToDelete?.description}"?`}
      />
      <LoaderModal isVisible={loading} text="Processing..." />
    </div>
  );
}

// ✅ Result

// Now /api/insights/finance:

// Checks Redis for cached narrative.

// If missing → generates via GPT → stores insight.

// Subsequent calls within TTL are instantaneous.

// Safe, stateless, and multi-tenant via schoolId scoping.
