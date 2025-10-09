"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

type FinanceRecord = {
  id?: string;
  type: string;
  amount: number;
  date: string;
  description: string;
};

type FinanceModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (record: FinanceRecord) => void;
  recordToEdit?: FinanceRecord;
};

export default function FinanceModal({
  isOpen,
  onClose,
  onSuccess,
  recordToEdit,
}: FinanceModalProps) {
  const [type, setType] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (recordToEdit) {
      setType(recordToEdit.type);
      setAmount(recordToEdit.amount);
      setDate(recordToEdit.date);
      setDescription(recordToEdit.description);
    } else {
      setType("");
      setAmount(0);
      setDate("");
      setDescription("");
    }
  }, [recordToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const record: FinanceRecord = {
        id: recordToEdit?.id || Date.now().toString(),
        type,
        amount,
        date,
        description,
      };

      // Mock API delay
      await new Promise((res) => setTimeout(res, 300));

      onSuccess(record);
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to save finance record");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 flex items-center justify-center bg-black/40 z-50"
    >
      <motion.form
        onSubmit={handleSubmit}
        className="bg-deepest0 p-6 rounded-lg w-full max-w-md shadow-lg"
      >
        <h2 className="text-xl font-display text-lightGray mb-4">
          {recordToEdit ? "Edit Finance Record" : "Add Finance Record"}
        </h2>

        <label className="block text-lightGray mb-1">Type</label>
        <input
          type="text"
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full p-2 mb-3 rounded bg-secondary text-lightGray focus:outline-none focus:ring-2 focus:ring-accentPurple"
          required
        />

        <label className="block text-lightGray mb-1">Amount</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="w-full p-2 mb-3 rounded bg-secondary text-lightGray focus:outline-none focus:ring-2 focus:ring-accentPurple"
          required
        />

        <label className="block text-lightGray mb-1">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full p-2 mb-3 rounded bg-secondary text-lightGray focus:outline-none focus:ring-2 focus:ring-accentPurple"
          required
        />

        <label className="block text-lightGray mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 mb-4 rounded bg-secondary text-lightGray focus:outline-none focus:ring-2 focus:ring-accentPurple"
          rows={3}
          required
        />

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-secondary text-lightGray rounded hover:bg-deeper transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-accentPurple text-background rounded hover:bg-purple0 transition-colors"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </motion.form>
    </motion.div>
  );
}
