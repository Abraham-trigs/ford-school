"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { FinanceRecord, FinanceType } from "@/types/finance";
import { toast } from "react-toastify";

interface FinanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (record: FinanceRecord) => void;
  recordToEdit?: FinanceRecord;
}

const financeTypes: FinanceType[] = [
  "INCOME",
  "EXPENSE",
  "SALARY",
  "PURCHASE",
  "OTHER",
];

export default function FinanceModal({
  isOpen,
  onClose,
  onSuccess,
  recordToEdit,
}: FinanceModalProps) {
  const [form, setForm] = useState<FinanceRecord>({
    type: "INCOME",
    amount: 0,
    date: new Date().toISOString().split("T")[0],
    description: "",
  });

  useEffect(() => {
    if (recordToEdit) setForm(recordToEdit);
  }, [recordToEdit]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "amount" ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = recordToEdit ? "put" : "post";
      const res = await axios[method]("/api/finance", form);
      onSuccess(res.data);
      toast.success(`Finance record ${recordToEdit ? "updated" : "added"}!`);
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error saving record");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">
          {recordToEdit ? "Edit Finance Record" : "Add Finance Record"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            >
              {financeTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Amount</label>
            <input
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input
              type="date"
              name="date"
              value={form.date.split("T")[0]}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <input
              type="text"
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-accentTeal text-white rounded"
            >
              {recordToEdit ? "Update" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
