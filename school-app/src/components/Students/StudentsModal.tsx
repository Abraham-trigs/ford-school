"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";

type Student = {
  id?: string;
  name: string;
  class: string;
  age: number;
  parent: string;
};

type StudentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (student: Student) => void;
  studentToEdit?: Student;
};

export default function StudentModal({
  isOpen,
  onClose,
  onSuccess,
  studentToEdit,
}: StudentModalProps) {
  const [name, setName] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [age, setAge] = useState<number>(0);
  const [parent, setParent] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (studentToEdit) {
      setName(studentToEdit.name);
      setStudentClass(studentToEdit.class);
      setAge(studentToEdit.age);
      setParent(studentToEdit.parent);
    } else {
      setName("");
      setStudentClass("");
      setAge(0);
      setParent("");
    }
  }, [studentToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let res;
      const payload = { name, class: studentClass, age, parent };

      if (studentToEdit?.id) {
        // Edit existing student
        res = await axios.put(`/api/students?id=${studentToEdit.id}`, payload);
      } else {
        // Create new student
        res = await axios.post("/api/students", payload);
      }

      onSuccess(res.data); // updated student returned from API
      onClose();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to save student");
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
          {studentToEdit ? "Edit Student" : "Add Student"}
        </h2>

        <label className="block text-lightGray mb-1">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 mb-3 rounded bg-secondary text-lightGray focus:outline-none focus:ring-2 focus:ring-accentPurple"
          required
        />

        <label className="block text-lightGray mb-1">Class</label>
        <input
          type="text"
          value={studentClass}
          onChange={(e) => setStudentClass(e.target.value)}
          className="w-full p-2 mb-3 rounded bg-secondary text-lightGray focus:outline-none focus:ring-2 focus:ring-accentPurple"
          required
        />

        <label className="block text-lightGray mb-1">Age</label>
        <input
          type="number"
          value={age}
          onChange={(e) => setAge(Number(e.target.value))}
          className="w-full p-2 mb-3 rounded bg-secondary text-lightGray focus:outline-none focus:ring-2 focus:ring-accentPurple"
          required
        />

        <label className="block text-lightGray mb-1">Parent</label>
        <input
          type="text"
          value={parent}
          onChange={(e) => setParent(e.target.value)}
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
