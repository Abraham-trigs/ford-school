"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";

type Exam = {
  id?: string;
  name: string;
  class: string;
  subject: string;
  date: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (exam: Exam) => void;
  examToEdit?: Exam;
};

export default function ExamModal({
  isOpen,
  onClose,
  onSuccess,
  examToEdit,
}: Props) {
  const [exam, setExam] = useState<Exam>({
    name: "",
    class: "",
    subject: "",
    date: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (examToEdit) setExam(examToEdit);
    else setExam({ name: "", class: "", subject: "", date: "" });
  }, [examToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let res;
      if (examToEdit?.id) {
        res = await axios.put("/api/exams", { ...exam });
      } else {
        res = await axios.post("/api/exams", { ...exam });
      }
      onSuccess(res.data);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save exam");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-background p-6 rounded-lg w-full max-w-md"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
      >
        <h2 className="text-xl font-semibold text-primary mb-4">
          {examToEdit ? "Edit Exam" : "Create Exam"}
        </h2>

        {error && <p className="text-errorPink mb-2">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Exam Name"
            value={exam.name}
            onChange={(e) => setExam({ ...exam, name: e.target.value })}
            required
            className="w-full p-2 rounded bg-secondary text-lightGray focus:outline-none focus:ring-2 focus:ring-accentPurple"
          />
          <input
            type="text"
            placeholder="Class"
            value={exam.class}
            onChange={(e) => setExam({ ...exam, class: e.target.value })}
            required
            className="w-full p-2 rounded bg-secondary text-lightGray focus:outline-none focus:ring-2 focus:ring-accentPurple"
          />
          <input
            type="text"
            placeholder="Subject"
            value={exam.subject}
            onChange={(e) => setExam({ ...exam, subject: e.target.value })}
            required
            className="w-full p-2 rounded bg-secondary text-lightGray focus:outline-none focus:ring-2 focus:ring-accentPurple"
          />
          <input
            type="date"
            value={exam.date}
            onChange={(e) => setExam({ ...exam, date: e.target.value })}
            required
            className="w-full p-2 rounded bg-secondary text-lightGray focus:outline-none focus:ring-2 focus:ring-accentPurple"
          />

          <div className="flex justify-end space-x-2 mt-4">
            <button
              type="button"
              className="px-4 py-2 bg-secondary text-lightGray rounded hover:bg-deeper transition-colors"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-accentPurple text-background rounded hover:bg-purple0 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
