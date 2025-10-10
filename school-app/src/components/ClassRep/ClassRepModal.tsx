"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { ClassRep } from "@/types/ClassRep";

type ClassRepModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (rep: ClassRep) => void;
  repToEdit?: ClassRep;
};

export default function ClassRepModal({
  isOpen,
  onClose,
  onSuccess,
  repToEdit,
}: ClassRepModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [classId, setClassId] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (repToEdit) {
      setName(repToEdit.name);
      setEmail(repToEdit.email);
      setPhone(repToEdit.phone || "");
      setClassId(repToEdit.classId);
    } else {
      setName("");
      setEmail("");
      setPhone("");
      setClassId("");
    }
  }, [repToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = { name, email, phone, classId };
      let res;

      if (repToEdit?.id) {
        res = await axios.put(`/api/class-reps?id=${repToEdit.id}`, payload);
      } else {
        res = await axios.post("/api/class-reps", payload);
      }

      onSuccess(res.data);
      onClose();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to save Class Rep");
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
          {repToEdit ? "Edit Class Rep" : "Add Class Rep"}
        </h2>

        <label className="block text-lightGray mb-1">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 mb-3 rounded bg-secondary text-lightGray focus:outline-none focus:ring-2 focus:ring-accentPurple"
          required
        />

        <label className="block text-lightGray mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-3 rounded bg-secondary text-lightGray focus:outline-none focus:ring-2 focus:ring-accentPurple"
          required
        />

        <label className="block text-lightGray mb-1">Phone</label>
        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full p-2 mb-3 rounded bg-secondary text-lightGray focus:outline-none focus:ring-2 focus:ring-accentPurple"
        />

        <label className="block text-lightGray mb-1">Class ID</label>
        <input
          type="text"
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
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
