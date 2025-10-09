"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { Auditor } from "@/types/Auditor";

type AuditorModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (auditor: Auditor) => void;
  auditorToEdit?: Auditor;
};

export default function AuditorModal({
  isOpen,
  onClose,
  onSuccess,
  auditorToEdit,
}: AuditorModalProps) {
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [level, setLevel] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (auditorToEdit) {
      setName(auditorToEdit.name);
      setDepartment(auditorToEdit.department);
      setLevel(auditorToEdit.level);
    } else {
      setName("");
      setDepartment("");
      setLevel("");
    }
  }, [auditorToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = { name, department, level };
      let res;

      if (auditorToEdit?.id) {
        res = await axios.put(`/api/auditors?id=${auditorToEdit.id}`, payload);
      } else {
        res = await axios.post("/api/auditors", payload);
      }

      onSuccess(res.data);
      onClose();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to save auditor");
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
          {auditorToEdit ? "Edit Auditor" : "Add Auditor"}
        </h2>

        <label className="block text-lightGray mb-1">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 mb-3 rounded bg-secondary text-lightGray focus:outline-none focus:ring-2 focus:ring-accentPurple"
          required
        />

        <label className="block text-lightGray mb-1">Department</label>
        <input
          type="text"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="w-full p-2 mb-3 rounded bg-secondary text-lightGray focus:outline-none focus:ring-2 focus:ring-accentPurple"
          required
        />

        <label className="block text-lightGray mb-1">Level</label>
        <input
          type="text"
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          className="w-full p-2 mb-4 rounded bg-secondary text-lightGray focus:outline-none focus:ring-2 focus:ring-accentPurple"
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
